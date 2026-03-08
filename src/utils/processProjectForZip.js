// utils/processProjectForZip.js
import { generateExportCode } from './exportGenerator';

/**
 * Processes a single project's data, extracts base64 files into the provided JSZip instance,
 * and generates the final HTML content.
 *
 * @param {JSZip} zip - The JSZip instance to add files to.
 * @param {Object} projectData - The data for the specific project (elements, bgImage, etc.)
 * @param {String} htmlFilename - The name of the HTML file (e.g., 'index')
 * @param {String} imageSubfolderName - (Optional) If provided, images go into images/subfolderName/
 */
export const processProjectForZip = (zip, projectData, htmlFilename, imageSubfolderName = '') => {
  const {
    elements = [], bgImage, bgImageStyle, bgImageTileSize, bgMusic, bgMusicMode,
    cursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor,
    keepAudioBase64, keepImagesBase64
  } = projectData;

  // Clone elements so we don't mutate the live state
  const clonedElements = JSON.parse(JSON.stringify(elements));

  // Determine the base image folder path
  const baseImgPath = imageSubfolderName ? `images/${imageSubfolderName}` : 'images';
  
  // Create the actual folder in the zip
  let imgFolder;
  if (!keepImagesBase64) {
      imgFolder = zip.folder(baseImgPath);
  }

  // Helper function to process Base64 files
  const processBase64File = (base64String, prefix, uniqueId) => {
    // If we are keeping base64 OR the string isn't valid base64, return it untouched
    if (keepImagesBase64 || !base64String || !base64String.startsWith('data:')) {
        return base64String;
    }

    try {
      const [header, base64Data] = base64String.split(',');
      const mimeMatch = header.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*;.*/);
      
      if (mimeMatch && base64Data) {
        const mimeType = mimeMatch[1];
        const ext = mimeType.split('/')[1] || 'png'; 
        const fileName = `${prefix}_${uniqueId}.${ext}`;
        
        // Add to the specific ZIP folder
        imgFolder.file(fileName, base64Data, { base64: true });
        
        // Return the relative path for the HTML to use
        return `${baseImgPath}/${fileName}`;
      }
    } catch (err) {
      console.error("Failed to process base64 file", err);
    }
    return base64String;
  };

  // 1. Process Page Background Image
  let finalBgImage = processBase64File(bgImage, 'bg', 'main');

  // 2. Process Page Cursor
  let finalCursor = processBase64File(cursor, 'cursor', 'main');

  // 3. Process Page Background Music
  let finalBgMusic = bgMusic;
  if (!keepAudioBase64 && bgMusic && bgMusic.startsWith('data:audio')) {
      const musicFolder = zip.folder("media");
      const [header, base64Data] = bgMusic.split(',');
      const ext = header.match(/data:audio\/([a-zA-Z0-9]+)/)?.[1] || 'mp3';
      
      // We can use the htmlFilename as a prefix to avoid audio collisions on multi-page exports
      const audioFileName = `bgm_${htmlFilename}.${ext}`;
      musicFolder.file(audioFileName, base64Data, { base64: true });
      finalBgMusic = `media/${audioFileName}`;
  }

  // 4. Process all Elements (Image tags and CSS Backgrounds)
  clonedElements.forEach((el, index) => {
    if (el.type === 'image' && el.src) {
      el.src = processBase64File(el.src, 'img', el.id || index);
    }
    
    if (el.style && el.style.backgroundImage) {
      el.style.backgroundImage = processBase64File(el.style.backgroundImage, 'bg', el.id || index);
    }
  });

  // 5. Generate the final HTML using the updated paths
  const htmlContent = generateExportCode(
    clonedElements, finalBgImage, bgImageStyle, bgImageTileSize, finalBgMusic, bgMusicMode, 
    finalCursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor
  );

  // 6. Add the HTML file to the root of the zip
  zip.file(`${htmlFilename}.html`, htmlContent);
};