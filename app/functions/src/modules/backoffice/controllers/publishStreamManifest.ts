import { getFileBuff, saveFileBuffer } from "../../../utils/storage";

export const publishStreamManifest = async (bucket: string, dir: string) => {
  // get the init stream file to modify it
  const streamConfigBuff = await getFileBuff(bucket, `${dir}/init.m3u8`);
  let streamConfigStr = streamConfigBuff.toString();

  // modify the stream init file with the encoded path
  streamConfigStr = streamConfigStr.replace(/chunk[-]{1}\d{8}\.mp4/gi, `${encodeURIComponent(`${dir}/`)}$&?alt=media`);

  // save the modified manifest
  await saveFileBuffer(bucket, `${dir}/init.m3u8`, Buffer.from(streamConfigStr));
};
