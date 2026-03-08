// utils/exportEntireSiteAsZip.js
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { processProjectForZip } from './processProjectForZip';

export const exportEntireSiteAsZip = async (projects, keepAudioBase64) => {
    const zip = new JSZip();
    
    // Loop through every project the user has created
    for (const projectId in projects) {
        const project = projects[projectId];
        const projectData = project.data; // Ensure we are passing the data object
        projectData.keepAudioBase64 = keepAudioBase64;
        // Ensure a clean filename
        let safeFileName = (projectData.htmlFilename || project.name).replace(/[^a-z0-9-_]/gi, '').toLowerCase();
        if (!safeFileName) safeFileName = `page_${projectId}`;
        
        // Remove .html if it's there so processProjectForZip can append it cleanly
        safeFileName = safeFileName.replace('.html', '');

        // Process this specific project.
        // We pass `safeFileName` as the 4th argument so its images go into `images/page_name/`
        processProjectForZip(zip, projectData, safeFileName, safeFileName);
    }

    // Zip it all up and serve it!
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `my_neocities_site_export.zip`);
};