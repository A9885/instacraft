import { NextResponse } from 'next/server';
import { requireAdmin } from "@/lib/requireAdmin";
import { getSiteConfig } from "@/lib/api-server";
import { writeFile, mkdir, readdir, readFile } from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

// Compute MD5 hash of a buffer
function hashBuffer(buffer) {
  return createHash('md5').update(buffer).digest('hex');
}

// Scan a folder and return the first file whose content matches the given hash
async function findMatchingFile(folderPath, targetHash) {
  try {
    const files = await readdir(folderPath);
    for (const filename of files) {
      try {
        const filePath = path.join(folderPath, filename);
        const existingBuffer = await readFile(filePath);
        const existingHash = hashBuffer(existingBuffer);
        if (existingHash === targetHash) {
          return filename; // Found a matching file!
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Folder doesn't exist or is unreadable
  }
  return null;
}

export async function POST(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // 1. Validate File Size (Dynamic limit from config)
    const siteConfig = await getSiteConfig(true);
    const maxMb = siteConfig?.maxUploadSize || 30;
    const MAX_FILE_SIZE = maxMb * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File exceeds ${maxMb}MB limit set by admin.` }, { status: 413 });
    }

    // 2. Validate MIME Type and determine secure extension
    const ALLOWED_MIME_TYPES = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/jpg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4']
    };
    
    const allowedExtensions = ALLOWED_MIME_TYPES[file.type];
    if (!allowedExtensions) {
      console.warn(`[Upload] Rejected unsupported MIME type: ${file.type}`);
      return NextResponse.json({ error: "Unsupported file type. Only JPG, PNG, WEBP, and MP4 are allowed." }, { status: 415 });
    }

    // Determine the extension to use (preserve original if it's one of the allowed ones)
    const originalExt = path.extname(file.name).toLowerCase();
    const secureExtension = allowedExtensions.includes(originalExt) ? originalExt : allowedExtensions[0];

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine folder based on file type
    const isVideo = file.type === 'video/mp4';
    const folderName = isVideo ? 'videos' : 'images';
    const uploadDir = path.join(process.cwd(), 'public', folderName);

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error(`[Upload] Failed to create directory ${uploadDir}:`, err);
      return NextResponse.json({ error: "Server storage configuration error." }, { status: 500 });
    }

    // Compute hash of the uploaded file content
    const uploadedHash = hashBuffer(buffer);

    // Search public/videos OR public/images for any file with identical content
    const existingFilename = await findMatchingFile(uploadDir, uploadedHash);
    if (existingFilename) {
      const url = `/${folderName}/${existingFilename}`;
      console.log(`[Upload] Reusing existing file: ${url}`);
      return NextResponse.json({ url, message: "Reused existing file" });
    }

    // 3. No match found — save as a new file with a short hash prefix and secure extension
    const originalNameWithoutExt = path.parse(file.name).name || 'file';
    const safeBaseName = originalNameWithoutExt.replace(/[^a-zA-Z0-9\-_]/g, '');
    const shortHash = uploadedHash.substring(0, 10);
    const filename = `${shortHash}-${safeBaseName}${secureExtension}`;
    const filepath = path.join(uploadDir, filename);
    
    try {
      await writeFile(filepath, buffer);
      console.log(`[Upload] Saved new file: /${folderName}/${filename}`);
    } catch (err) {
      console.error(`[Upload] Failed to write file to ${filepath}:`, err);
      return NextResponse.json({ error: "Failed to save file to server." }, { status: 500 });
    }

    return NextResponse.json({ url: `/${folderName}/${filename}` });

  } catch (error) {
    console.error("Critical Upload Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during upload." }, { status: 500 });
  }
}
