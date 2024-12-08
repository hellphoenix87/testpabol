import { Character } from "../schema/Character.schema";
import { Location } from "../schema/Location.schema";
import { CreationMeta } from "../schema/CreationMeta.schema";
import { firestoreAdmin } from "../test-utils/firebase-mock";
import * as creationRepository from "./creationRepository";
import { Shot } from "../schema/Shot.schema";
import { Scene } from "../schema/Scene.schema";
import * as collectionGetters from "./collectionGetters";
import AcousticEnvironments from "../../../shared/constants/acousticEnvironments";

jest.mock("firebase-admin", () => firestoreAdmin);

jest.mock("./collectionGetters", () => ({
  getCreationSnapshot: jest.fn(() => ({
    exists: true,
    data: () => ({}),
  })),
  getCreationDoc: jest.fn(() => ({ set: jest.fn() })),
  getCharacterListSnapshot: jest.fn(() => ({ docs: [{}] })),
  getLocationListSnapshot: jest.fn(() => ({ docs: [{}] })),
  getSceneData: jest.fn(() => ({})),
  getShotListSnapshot: jest.fn(() => ({ docs: [{}] })),
  getSceneDoc: jest.fn(() => ({})),
  getShotListDoc: jest.fn(() => ({ doc: jest.fn().mockReturnValue({}) })),
  getShotDoc: jest.fn(() => ({})),
}));

const uid = "user123";
const creationId = "creation123";

describe("creationRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCreationData", () => {
    it("should return creation data", async () => {
      const creationData: CreationMeta = {
        attributes: ["Hero", "Moral"],
        genre: 0, // Action
        audience: 0, // Children
        userText: "A movie about pirates",
        charactersOrder: [],
        locationsOrder: [],
      };

      (collectionGetters.getCreationSnapshot as jest.Mock).mockReturnValueOnce({
        exists: true,
        data: () => creationData,
      });

      const result = await creationRepository.getCreationData(uid, creationId);

      expect(collectionGetters.getCreationSnapshot).toHaveBeenCalledWith(uid, creationId);
      expect(result).toEqual(creationData);
    });

    it("should return null if doc does not exist", async () => {
      (collectionGetters.getCreationSnapshot as jest.Mock).mockReturnValueOnce({
        exists: false,
      });

      const result = await creationRepository.getCreationData(uid, creationId);

      expect(collectionGetters.getCreationSnapshot).toHaveBeenCalledWith(uid, creationId);
      expect(result).toBeNull();
    });
  });

  describe("getCharactersListData", () => {
    it("should return characters list", async () => {
      const charactersData: Character[] = [
        {
          id: "0",
          name: "Jack Sparrow",
          desc: "A pirate",
          role: "Hero",
          voice_desc: "",
          voice_sample_urls: ["voice.mp3"],
          pitch: 0,
          voices: [0],
          selected_voice_index: 0,
          user_created: false,
          images: ["image.png"],
          embedding_ids: [1],
          selected_image_index: 0,
        },
        {
          id: "1",
          name: "Black Beard",
          desc: "A pirate",
          role: "Villain",
          voice_desc: "",
          voice_sample_urls: ["voice.mp3"],
          pitch: 0,
          voices: [0],
          selected_voice_index: 0,
          user_created: false,
          images: ["image.png"],
          embedding_ids: [1],
          selected_image_index: 0,
        },
      ];

      const charactersDocs = {
        docs: [
          {
            exists: true,

            id: "character123",
            data: jest.fn().mockReturnValue(charactersData[0]),
          },
          {
            exists: true,

            id: "character456",
            data: jest.fn().mockReturnValue(charactersData[1]),
          },
        ],
      };

      (collectionGetters.getCharacterListSnapshot as jest.Mock).mockReturnValueOnce(charactersDocs);

      const result = await creationRepository.getCharactersListData(uid, creationId);

      expect(collectionGetters.getCharacterListSnapshot).toHaveBeenCalledWith(uid, creationId);
      expect(result).toEqual(charactersData);
    });

    it("should return empty list if doc does not exist", async () => {
      (collectionGetters.getCharacterListSnapshot as jest.Mock).mockReturnValueOnce({ docs: [{}] });

      const result = await creationRepository.getCharactersListData(uid, creationId);

      expect(collectionGetters.getCharacterListSnapshot).toHaveBeenCalledWith(uid, creationId);
      expect(result).toEqual([]);
    });
  });

  describe("getLocationsListData", () => {
    it("should return locations list", async () => {
      const locationsData: Location[] = [
        {
          id: "0",
          name: "Tortuga",
          desc: "A pirate town",
          user_created: false,
          images: ["image.png"],
          selected_image_index: 0,
        },
        {
          id: "1",
          name: "Port Royal",
          desc: "A pirate town",
          user_created: false,
          images: ["image.png"],
          selected_image_index: 0,
        },
      ];

      const locationsDocs = {
        docs: [
          {
            exists: true,

            id: "location123",
            data: jest.fn().mockReturnValue(locationsData[0]),
          },
          {
            exists: true,

            id: "location456",
            data: jest.fn().mockReturnValue(locationsData[1]),
          },
        ],
      };

      (collectionGetters.getLocationListSnapshot as jest.Mock).mockReturnValueOnce(locationsDocs);

      const result = await creationRepository.getLocationsListData(uid, creationId);

      expect(collectionGetters.getLocationListSnapshot).toHaveBeenCalledWith(uid, creationId);
      expect(result).toEqual(locationsData);
    });

    it("should return empty list if doc does not exist", async () => {
      (collectionGetters.getLocationListSnapshot as jest.Mock).mockReturnValueOnce({ docs: [{}] });

      const result = await creationRepository.getLocationsListData(uid, creationId);

      expect(collectionGetters.getLocationListSnapshot).toHaveBeenCalledWith(uid, creationId);
      expect(result).toEqual([]);
    });
  });

  describe("getShotListData", () => {
    it("should return shots list", async () => {
      const shotId = "0";
      const shotsData: Shot[] = [
        {
          id: shotId,
          content: "Pirates war",
          image_url: "Pirates war",
          bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
          location: 2,
          shot_type: 3,
          sound: "Pirates war",
          sound_urls: ["Pirates war"],
          acoustic_env: AcousticEnvironments.HALL,
          selected_sound_index: 0,
          dialog: [],
          user_created: false,
        },
      ];

      const shotsDocs = {
        docs: [
          {
            exists: true,
            id: shotId,
            data: jest.fn().mockReturnValue(shotsData[0]),
          },
        ],
      };

      (collectionGetters.getSceneData as jest.Mock).mockResolvedValueOnce({ shots_order: [shotId] });
      (collectionGetters.getShotListSnapshot as jest.Mock).mockResolvedValueOnce(shotsDocs);

      const sceneId = "0";

      const result = await creationRepository.getShotListData(uid, creationId, sceneId);

      expect(collectionGetters.getSceneData).toHaveBeenCalledWith(uid, creationId, sceneId);
      expect(collectionGetters.getShotListSnapshot).toHaveBeenCalledWith(uid, creationId, sceneId);

      expect(result).toEqual(shotsData);
    });

    it("should return empty list if doc does not exist", async () => {
      const sceneId = "0";

      (collectionGetters.getSceneData as jest.Mock).mockResolvedValueOnce({ shots_order: [] });
      (collectionGetters.getShotListSnapshot as jest.Mock).mockResolvedValueOnce({ data: jest.fn(), docs: [] });

      const result = await creationRepository.getShotListData(uid, creationId, sceneId);

      expect(collectionGetters.getSceneData).toHaveBeenCalledWith(uid, creationId, sceneId);
      expect(collectionGetters.getShotListSnapshot).toHaveBeenCalledWith(uid, creationId, sceneId);

      expect(result).toEqual([]);
    });
  });

  describe("setScenesData", () => {
    const setSceneDataSpy = jest.spyOn(creationRepository, "setSceneData");

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should save scenes list", async () => {
      const scenesData: Scene[] = [
        {
          id: "0",
          scene_title: "Pirates war",
          desc: "Pirates war",
          music_desc: "Pirates war",
          musics: [
            {
              id: "music123",
            },
          ],
          music_url: "Pirates war",
          selected_music_index: 0,
          user_created: false,
          shots: [
            {
              id: "shot123",
              content: "Pirates war shot",
              image_url: "Pirates war shot",
              bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
              location: 0,
              shot_type: 1,
              sound: "Pirates war shot",
              sound_urls: ["Pirates war shot"],
              acoustic_env: AcousticEnvironments.HALL,
              selected_sound_index: 0,
              dialog: [],
              user_created: false,
            },
          ],
        },
      ];

      await creationRepository.setScenesData(uid, creationId, scenesData);

      expect(setSceneDataSpy).toHaveBeenCalledWith(uid, creationId, scenesData[0]);
    });
  });

  describe("setSceneData", () => {
    const setShotListDataSpy = jest.spyOn(creationRepository, "setShotListData");

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should save scene data", async () => {
      const scene = {
        id: "0",
        scene_title: "Pirates war",
        desc: "Pirates war",
        music_desc: "Pirates war",
        musics: [{ id: "music123" }],
        music_url: "Pirates war",
        selected_music_index: 0,
        user_created: false,
        shots_order: ["shot123"],
      };
      const shot = {
        id: "shot123",
        content: "Pirates war shot",
        image_url: "Pirates war shot",
        bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
        location: 0,
        shot_type: 1,
        sound: "Pirates war shot",
        sound_urls: ["Pirates war shot"],
        acoustic_env: AcousticEnvironments.HALL,
        selected_sound_index: 0,
        dialog: [],
        user_created: false,
      };
      const sceneData: Scene = {
        ...scene,
        shots: [shot],
      };

      const sceneId = "0";

      (collectionGetters.getSceneDoc as jest.Mock).mockReturnValueOnce(sceneData);
      (collectionGetters.getShotListDoc as jest.Mock).mockReturnValueOnce({
        doc: jest.fn().mockReturnValue(shot),
      });

      await creationRepository.setSceneData(uid, creationId, sceneData);

      expect(collectionGetters.getSceneDoc).toHaveBeenCalledWith(uid, creationId, sceneId);
      expect(setShotListDataSpy).toHaveBeenCalledWith({ uid, creationId, sceneId, shots: sceneData.shots });

      expect(firestoreAdmin.batchSpy.set).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining(scene), {
        merge: true,
      });

      expect(firestoreAdmin.batchSpy.commit).toHaveBeenCalled();
    });

    it("should fall back to the passed shots array order if property not passed", async () => {
      const scene = {
        id: "0",
        scene_title: "Pirates war",
        desc: "Pirates war",
        music_desc: "Pirates war",
        musics: [{ id: "music123" }],
        music_url: "Pirates war",
        selected_music_index: 0,
        user_created: false,
      };
      const shots = [
        {
          id: "shot124",
          content: "Pirates war shot",
          image_url: "Pirates war shot",
          location: 0,
          shot_type: 1,
          sound: "Pirates war shot",
          sound_urls: ["Pirates war shot"],
          selected_sound_index: 0,
          dialog: [],
          acoustic_env: "hall",
          bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
          user_created: false,
        },
        {
          id: "shot123",
          content: "Pirates war shot",
          image_url: "Pirates war shot",
          location: 0,
          shot_type: 1,
          sound: "Pirates war shot",
          sound_urls: ["Pirates war shot"],
          selected_sound_index: 0,
          dialog: [],
          acoustic_env: "hall",
          bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
          user_created: false,
        },
      ];
      const sceneData: Scene = { ...scene, shots };

      (collectionGetters.getSceneDoc as jest.Mock).mockReturnValueOnce(sceneData);
      (collectionGetters.getShotListDoc as jest.Mock).mockReturnValueOnce({
        doc: jest.fn().mockReturnValue(shots),
      });

      await creationRepository.setSceneData(uid, creationId, sceneData);

      expect(firestoreAdmin.batchSpy.set).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          ...scene,
          shots_order: ["shot124", "shot123"],
        }),
        {
          merge: true,
        }
      );
    });
  });
});
