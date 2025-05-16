# Instructions for Uploading Files to GitHub

Since we've encountered file size limitations when pushing through Git, you can use GitHub's web interface to upload the files:

1. Go to your repository: https://github.com/timothyjjcrow/Humbold-Electric

2. Click on the "Add file" button on the top right of the file list and select "Upload files"

3. Drag and drop files or use the file selector to upload files:

   - Start with all image files (_.jpg, _.png)
   - Then upload PDF files (\*.pdf)
   - Upload any script files and HTML files

4. Add a commit message like "Add image files" or "Add PDF files"

5. Click "Commit changes"

## Folder Structure to Maintain

Make sure to upload files to the correct directory structure:

- Root directory:

  - index.html
  - style.css
  - script.js
  - README.md
  - Home.html
  - convert_pdfs.py
  - All image files (wireing1.jpg, wiring2.jpg, etc.)
  - All PDF files (LutronShades.pdf, RadioRa3.pdf)

- /images/carousel-lutron/

  - page_1.png through page_23.png

- /images/carousel-radiora3/

  - page_1.png through page_26.png

- /scripts/
  - scrape_carousels.py

## File Sizes

Be aware that GitHub has file size limitations:

- Files must be under 100 MB
- Repositories are generally encouraged to stay under 1 GB in size
