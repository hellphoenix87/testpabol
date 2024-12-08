## Precomputed data

Precomputed data (images, music, sound, ...) are stored in GCP Buckets in the `precompute-<date>` GCP Project. The `date` has nothing to do with the version of the data, it's just the name of the GCP Project.

Only embeddings (\*.npy or JSON data) are stored in this repository.

To update precompute assets:

1. Go to the `precompute-<date>` GCP Project to get the buckets names

2. For `asset`, `musicdb`, `sound`, `voicedb` buckets: upload under a new folder (name template `YYYY-MM-DD`) of the target bucket, ie:

   ```bash
   gsutil -m cp -r <local-folder> "gs://<bucket>/<YYYY-MM-DD>"
   ```

3. For `appspot` bucket:

   1. upload the new `avatars`/`demo` folder to the bucket:

      ```bash
      gsutil -m cp -r avatars "gs://<bucket>/avatars"
      gsutil -m cp -r demo "gs://<bucket>/demo"
      ```

   2. Update the `version.txt` file, it is used to trigger a new sync:

      ```bash
      date +"%Y-%m-%d" >/tmp/version.txt
      gsutil cp /tmp/version.txt "gs://<bucket>/version.txt"
      ```

4. Update accordingly the `PRECOMPUTE_*_VER` variables in the `.env` and `.env.ci` files to target the new asset version.

# Circular dependency

If the tests in your PR depend on the data in the bucket (for example if you need to recreate test assets that rely on bucket data), you first need to run CI on your PR which triggers the bucket sync. Then you can run the tests locally.
