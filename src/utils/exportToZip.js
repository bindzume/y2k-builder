import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateExportCode } from './exportGenerator'; // Your existing function

export const exportWebsiteAsZip = async (
  elements, bgImage, bgImageStyle, bgImageTileSize, bgMusic, bgMusicMode, cursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor, keepAudioBase64 
) => {
  const zip = new JSZip();
  const imgFolder = zip.folder("images");
  
  // Create a deep copy of elements so we don't accidentally ruin the live editor state
  const clonedElements = JSON.parse(JSON.stringify(elements));

  // Helper function: Takes a base64 string, adds it to the zip, and returns the relative path
  const processBase64File = (base64String, prefix, uniqueId) => {
    if (!base64String || !base64String.startsWith('data:')) return base64String;

    try {
      // Split "data:image/png;base64,iVBORw0K..." into parts
      const [header, base64Data] = base64String.split(',');
      const mimeMatch = header.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*;.*/);
      
      if (mimeMatch && base64Data) {
        const mimeType = mimeMatch[1];
        // Guess extension from mime type (e.g., image/png -> png)
        const ext = mimeType.split('/')[1] || 'png'; 
        const fileName = `${prefix}_${uniqueId}.${ext}`;
        
        // Add the pure base64 data to our zip folder
        imgFolder.file(fileName, base64Data, { base64: true });
        
        // Return the Neocities-friendly relative path!
        return `images/${fileName}`;
      }
    } catch (err) {
      console.error("Failed to process base64 file", err);
    }
    return base64String; // Fallback to original if something fails
  };

  // 1. Process Page Background Image
  let finalBgImage = processBase64File(bgImage, 'bg', 'main');

  // 2. Process Page Cursor
  let finalCursor = processBase64File(cursor, 'cursor', 'main');

  // 3. Process Page Background Music
  let finalBgMusic = bgMusic;
  
  // IF the user unchecked the box, extract it! 
  // IF they left it checked, ignore this block and leave it as Base64 text.
  if (!keepAudioBase64 && bgMusic && bgMusic.startsWith('data:audio')) {
      const musicFolder = zip.folder("media");
      const [header, base64Data] = bgMusic.split(',');
      const ext = header.match(/data:audio\/([a-zA-Z0-9]+)/)?.[1] || 'mp3';
      musicFolder.file(`bgm.${ext}`, base64Data, { base64: true });
      finalBgMusic = `media/bgm.${ext}`;
  }

  // 4. Process all Elements (Image tags and CSS Backgrounds)
  clonedElements.forEach(el => {
    // Standard Image Elements
    if (el.type === 'image' && el.src) {
      el.src = processBase64File(el.src, 'img', el.id);
    }
    
    // CSS Background Images on Flex/Divs
    if (el.style && el.style.backgroundImage) {
      el.style.backgroundImage = processBase64File(el.style.backgroundImage, 'bg', el.id);
    }
  });

  // 5. Generate the final HTML using your beautifully clean relative paths
  const htmlContent = generateExportCode(
    clonedElements, finalBgImage, bgImageStyle, bgImageTileSize, finalBgMusic, bgMusicMode, finalCursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor
  );

  // Add the HTML file to the root of the zip
  zip.file("index.html", htmlContent);

  // 6. Generate the Zip file and trigger the download!
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "my_site.zip");
};