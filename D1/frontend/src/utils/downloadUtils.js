// Download utilities for project export functionality

/**
 * Creates and downloads a ZIP file containing all project files
 * @param {Object} projectData - Project data from API
 */
export const downloadProjectAsZip = async (projectData) => {
  try {
    // Check if JSZip is available
    if (typeof window.JSZip === 'undefined') {
      throw new Error('JSZip library not loaded');
    }

    const zip = new window.JSZip();
    const { projectName, files, description, owner, createdAt } = projectData;

    // Create a README file with project info
    const readmeContent = `# ${projectName}

${description || 'No description provided'}

**Owner:** ${owner}
**Created:** ${new Date(createdAt).toLocaleDateString()}
**Files:** ${files.length}

---

This project was exported from Repofox - Collaborative Development Platform.
`;

    zip.file('README.md', readmeContent);

    // Add all project files to ZIP
    files.forEach(file => {
      // Handle file paths - ensure proper structure
      let filePath = file.path === '/' ? file.name : `${file.path}/${file.name}`;
      
      // Remove leading slash if present
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }

      // Add file content to ZIP
      zip.file(filePath, file.content || '');
    });

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // Create download link and trigger download
    const url = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error creating ZIP download:', error);
    throw error;
  }
};

/**
 * Alternative download as single text file (fallback option)
 * @param {Object} projectData - Project data from API
 */
export const downloadProjectAsText = (projectData) => {
  try {
    const { projectName, files, description, owner, createdAt } = projectData;

    let content = `${projectName}
${'='.repeat(projectName.length)}

Description: ${description || 'No description provided'}
Owner: ${owner}
Created: ${new Date(createdAt).toLocaleDateString()}
Files: ${files.length}

${'='.repeat(50)}

`;

    // Add each file's content
    files.forEach((file, index) => {
      content += `
File ${index + 1}: ${file.name}
Path: ${file.path}
Language: ${file.language || 'text'}
Size: ${file.size || file.content?.length || 0} characters
Last Modified: ${file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Unknown'}

Content:
${'-'.repeat(40)}
${file.content || '(empty file)'}
${'-'.repeat(40)}

`;
    });

    // Create and download text file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error creating text download:', error);
    throw error;
  }
};