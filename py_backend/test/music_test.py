import unittest
from prmx import music


class Test_TestMusic(unittest.TestCase):
    def test_lookup_on_precomputed_embed(self):
        # test if the same embed is returned when it is passed to the search
        _, embeds = music.get_precomputed_embeds_ids_attrib()
        embed_number = 0
        k = 3
        test_embed = embeds[embed_number]
        k_nearest = music.k_nearest_vectors(test_embed, embeds, k=k)
        target = embed_number
        result = k_nearest[0]
        self.assertEqual(target, result)
        self.assertEqual(len(k_nearest), k)
