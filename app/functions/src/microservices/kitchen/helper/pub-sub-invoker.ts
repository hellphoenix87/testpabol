import { PubSub, Topic, Message } from "@google-cloud/pubsub";
import { wait } from "../../../../../shared/videoCreator/utils";
import { SadTalkerRequestProps } from "./generate-sad-talker";
import { animateVideoPart } from "../endpoints";

const senderTopicName = "videogen-host";
const receiverTopicName = process.env.PABOLO_TOPIC_RESPONSE_VIDEOGEN || "";
const senderProjectId = process.env.PABOLO_TOPIC_GCP_PROJECT;
const receiverProjectId = process.env.PABOLO_PROJECT_ID;
const commitHash = process.env.__COMMIT_HASH__ || "";
const localSubscription = "local-subscription";

export type PubSubMessage = { dataframe_records: SadTalkerRequestProps[] };

export class PubSubService {
  senderPubsub?: PubSub;
  senderTopic?: Topic;
  constructor() {
    this.init();
  }

  init() {
    this.senderPubsub = new PubSub(senderProjectId ? { projectId: senderProjectId } : undefined);
    this.senderTopic = this.senderPubsub?.topic(senderTopicName);
    if (process.env.FUNCTIONS_EMULATOR === "true") {
      this.listenToTopic({
        name: receiverTopicName,
        projectId: receiverProjectId,
        handler: animateVideoPart,
      });
    }
  }

  async publish(data: PubSubMessage, attributes?: Record<string, string>): Promise<{ messageId?: string }> {
    if (!this.senderTopic) {
      this.init();
    }
    const message = {
      json: data,
      attributes: {
        event_version: process.env.PUBSUB_EVENT_VERSION || "1.0",
        source: `R${commitHash}_kitchen`,
        event_time: new Date().toISOString(),
        data_content_type: "application/json",
        commit_hash: commitHash,
        response_topic_name: receiverTopicName,
        response_topic_project: receiverProjectId,
        ...attributes,
      },
    };
    const messageId = await this.publishMessage({ message, topic: this.senderTopic as Topic });
    return { messageId };
  }

  private async publishMessage({ message, topic }: { message: any; topic: Topic }, retry = 0): Promise<string> {
    try {
      return await topic.publishMessage(message);
    } catch (e) {
      if (retry < 20) {
        await wait(10);
        return this.publishMessage({ message, topic }, retry + 1);
      }
      throw e;
    }
  }

  private listenToTopic({
    name,
    projectId,
    handler,
  }: {
    name: string;
    projectId?: string;
    handler: (m: { data: any; attributes: Record<string, string> }) => Promise<void>;
  }) {
    new PubSub({ projectId })
      .topic(name)
      .subscription(localSubscription)
      .on("message", async (message: Message) => {
        if (message.attributes.commit_hash !== commitHash) {
          return;
        }

        await handler({
          data: JSON.parse(message.data.toString()),
          attributes: message.attributes,
        });

        message.ack();
      });
  }
}
