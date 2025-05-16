#!/usr/bin/env python3
import os
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Error: PyMuPDF (fitz) module not found.")
    print("Please install it using:")
    print("  pip3 install --user pymupdf")
    print("Or try:")
    print("  python3 -m pip install --user pymupdf")
    sys.exit(1)

# --- Configuration ---
PDF_FILES = {
    "LutronShades.pdf": "images/carousel-lutron",
    "RadioRa3.pdf": "images/carousel-radiora3",
}
IMAGE_FORMAT = "png"  # Can be "png" or "jpg"
IMAGE_PREFIX = "page"
DPI = 150  # Higher values = better quality but larger files

# --- Helper Functions ---
def ensure_dir_exists(dir_path):
    """Creates a directory if it doesn't exist."""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        print(f"Created directory: {dir_path}")

def convert_pdf_to_images(pdf_path, output_dir):
    """Converts a PDF to images using PyMuPDF and saves them in the output directory."""
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        return 0

    ensure_dir_exists(output_dir)
    
    print(f"Processing {pdf_path}...")
    try:
        # Open the PDF file
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        
        if total_pages == 0:
            print(f"Error: The PDF {pdf_path} has no pages.")
            return 0
            
        print(f"PDF has {total_pages} pages.")
        
        # Set a reasonable zoom factor (higher = better quality but larger files)
        zoom_factor = DPI / 72  # Standard PDF is 72 DPI, so adjust accordingly
        mat = fitz.Matrix(zoom_factor, zoom_factor)
        
        # Process each page
        created_files_count = 0
        for page_num in range(total_pages):
            # Get the page
            page = doc.load_page(page_num)
            
            # Get the pixmap (image) of the page
            pix = page.get_pixmap(matrix=mat, alpha=False)
            
            # Construct output filename
            output_filename = f"{IMAGE_PREFIX}_{page_num + 1}.{IMAGE_FORMAT.lower()}"
            output_filepath = os.path.join(output_dir, output_filename)
            
            # Save the pixmap as an image
            pix.save(output_filepath)
            print(f"  Saved: {output_filepath}")
            created_files_count += 1
            
        print(f"Successfully converted {pdf_path} into {created_files_count} images in {output_dir}.")
        doc.close()
        return created_files_count
        
    except Exception as e:
        print(f"An error occurred while processing {pdf_path}: {e}")
        return 0

# --- Main Execution ---
if __name__ == "__main__":
    total_images_generated = 0
    generated_files_map = {}  # To store {pdf_name: [image_paths]}

    for pdf_file, output_subdir in PDF_FILES.items():
        # Process each PDF
        num_images = convert_pdf_to_images(pdf_file, output_subdir)
        total_images_generated += num_images
        
        if num_images > 0:
            generated_files_map[pdf_file] = [
                os.path.join(output_subdir, f"{IMAGE_PREFIX}_{i+1}.{IMAGE_FORMAT.lower()}")
                for i in range(num_images)
            ]

    print(f"\n--- Conversion Summary ---")
    if total_images_generated > 0:
        print(f"Successfully generated a total of {total_images_generated} images.")
        for pdf, images in generated_files_map.items():
            print(f"  For {pdf}:")
            for img_path in images:
                print(f"    - {img_path}")
            
        print("\nThese images can now be used in your HTML carousel instead of PDF renderings.")
    else:
        print("No images were generated. Please check the error messages above.") 