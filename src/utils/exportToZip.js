// utils/exportToZip.js
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { processProjectForZip } from './processProjectForZip';

export const exportWebsiteAsZip = async (
  elements, bgImage, bgImageStyle, bgImageTileSize, bgMusic, bgMusicMode, cursor, 
  pageTitle, pageHeight, pagePadding, pageMargin, pageColor, keepAudioBase64, 
  htmlFilename, keepImagesBase64 
) => {
  const zip = new JSZip();

  // Package all the separate arguments into a single object for the processor
  const projectData = {
      elements, bgImage, bgImageStyle, bgImageTileSize, bgMusic, bgMusicMode, cursor,
      pageTitle, pageHeight, pagePadding, pageMargin, pageColor, keepAudioBase64, keepImagesBase64
  };

  // Process the single project (no subfolder needed for images since it's just one page)
  processProjectForZip(zip, projectData, htmlFilename || 'index', htmlFilename);

  // Generate and save
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${htmlFilename || 'my_site'}.zip`);
};