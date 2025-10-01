import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/ApiService';

export default function Files({ project, onFileSelect }) {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');

  const isOwner = project?.owner?._id === user?.id;

  useEffect(() => {
    if (project?.files) {
      // Filter files by current path
      const pathFiles = project.files.filter(file => {
        if (currentPath === '/') {
          // Root level - show files with path '/' and folders at root
          return file.path === '/' || (file.path === '/' && file.type === 'folder');
        } else {
          // Show files in the current directory
          return file.path === currentPath;
        }
      });
      setFiles(pathFiles);
    }
  }, [project, currentPath]);

  const getFileIcon = (fileName, fileType) => {
    if (fileType === 'folder') return '📁';
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'md': return '📝';
      case 'js': case 'jsx': return '⚡';
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'json': return '📋';
      case 'py': return '🐍';
      case 'java': return '☕';
      case 'txt': return '📄';
      case 'png': case 'jpg': case 'jpeg': case 'gif': return '🖼️';
      case 'pdf': return '📕';
      case 'zip': case 'tar': case 'gz': return '📦';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileClick = (file) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path === '/' ? `/${file.name}` : `${file.path}/${file.name}`);
    } else {
      setSelectedFile(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleBackClick = () => {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length === 1) {
      setCurrentPath('/');
    } else {
      pathParts.pop();
      setCurrentPath('/' + pathParts.join('/'));
    }
  };

  const getBreadcrumbs = () => {
    if (currentPath === '/') return [{ name: project?.name || 'Project', path: '/' }];
    
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: project?.name || 'Project', path: '/' }];
    
    let buildPath = '';
    parts.forEach(part => {
      buildPath += `/${part}`;
      breadcrumbs.push({ name: part, path: buildPath });
    });
    
    return breadcrumbs;
  };

  // File operation handlers
  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      for (const file of selectedFiles) {
        const result = await ApiService.uploadFile(project._id, file, currentPath);
        if (!result.success) {
          throw new Error(result.error);
        }
      }
      
      // Refresh project data
      window.location.reload(); // Simple refresh for now
      setShowUpload(false);
    } catch (err) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.createFolder(project._id, folderName.trim(), currentPath);
      if (result.success) {
        setFolderName('');
        setShowCreateFolder(false);
        window.location.reload(); // Simple refresh for now
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = async () => {
    if (!fileName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.createFile(project._id, fileName.trim(), fileContent, currentPath);
      if (result.success) {
        setFileName('');
        setFileContent('');
        setShowCreateFile(false);
        window.location.reload(); // Simple refresh for now
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to create file');
    } finally {
      setLoading(false);
    }
  };

  const renderFileContent = (file) => {
    if (!file || file.type === 'folder') return null;

    const isTextFile = ['md', 'txt', 'js', 'jsx', 'html', 'css', 'json', 'py', 'java', 'xml', 'yml', 'yaml'].includes(
      file.name.split('.').pop()?.toLowerCase()
    );

    if (isTextFile) {
      return (
        <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
            <span className="text-orange-400 font-semibold">{file.name}</span>
            <span className="text-gray-400 text-xs">
              {formatFileSize(file.size || file.content?.length || 0)}
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-gray-300 max-h-96 overflow-y-auto">
            {file.content || 'No content available'}
          </pre>
        </div>
      );
    }

    return (
      <div className="bg-gray-700 p-6 rounded-lg text-center">
        <div className="text-4xl mb-2">{getFileIcon(file.name, file.type)}</div>
        <p className="text-white font-medium">{file.name}</p>
        <p className="text-gray-400 text-sm mt-1">
          {formatFileSize(file.size || 0)}
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* File Browser Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                <button
                  onClick={() => setCurrentPath(crumb.path)}
                  className={`hover:text-orange-400 ${
                    index === getBreadcrumbs().length - 1 ? 'text-orange-400 font-medium' : 'text-gray-400'
                  }`}
                >
                  {crumb.name}
                </button>
                {index < getBreadcrumbs().length - 1 && (
                  <span className="text-gray-500">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowUpload(true)}
              className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-sm"
            >
              📤 Upload
            </button>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm"
              title="Create folder"
            >
              📁 New Folder
            </button>
            <button
              onClick={() => setShowCreateFile(true)}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
              title="Create file"
            >
              📄 New File
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* File List */}
        <div className="bg-gray-800 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold flex items-center">
              <span className="mr-2">📂</span>
              Files {currentPath !== '/' && `in ${currentPath}`}
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {/* Back button */}
            {currentPath !== '/' && (
              <div
                onClick={handleBackClick}
                className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700"
              >
                <span className="mr-3">↩️</span>
                <span className="text-gray-400">..</span>
              </div>
            )}

            {/* File list */}
            {files.length > 0 ? (
              files.map((file, index) => (
                <div
                  key={`${file.path}-${file.name}-${index}`}
                  onClick={() => handleFileClick(file)}
                  className={`flex items-center justify-between p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 ${
                    selectedFile?.name === file.name ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="mr-3 text-lg">{getFileIcon(file.name, file.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white truncate">{file.name}</p>
                      <p className="text-gray-400 text-xs">
                        {file.type === 'file' ? formatFileSize(file.size || file.content?.length || 0) : 'Folder'}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs ml-2">
                    {new Date(file.updatedAt || file.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">
                <p className="mb-2">📭 No files in this directory</p>
                {isOwner && (
                  <p className="text-xs">Upload files or create folders to get started</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* File Preview */}
        <div className="bg-gray-800 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">
              {selectedFile ? `Preview: ${selectedFile.name}` : 'Select a file to preview'}
            </h3>
          </div>
          
          <div className="p-4">
            {selectedFile ? (
              renderFileContent(selectedFile)
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="mb-2">👁️ File Preview</p>
                <p className="text-sm">Click on a file to see its contents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
            
            {error && (
              <div className="bg-red-900 border border-red-600 text-red-200 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select files to upload
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Upload to: {currentPath === '/' ? 'root directory' : currentPath}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUpload(false)}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            
            {error && (
              <div className="bg-red-900 border border-red-600 text-red-200 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="folder-name"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <p className="text-xs text-gray-400 mt-1">
                Create in: {currentPath === '/' ? 'root directory' : currentPath}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setFolderName('');
                  setError(null);
                }}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded"
                disabled={loading || !folderName.trim()}
              >
                {loading ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create File Modal */}
      {showCreateFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Create New File</h3>
            
            {error && (
              <div className="bg-red-900 border border-red-600 text-red-200 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="filename.txt"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Content (Optional)
              </label>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                placeholder="Enter file content..."
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Create in: {currentPath === '/' ? 'root directory' : currentPath}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateFile(false);
                  setFileName('');
                  setFileContent('');
                  setError(null);
                }}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                disabled={loading || !fileName.trim()}
              >
                {loading ? 'Creating...' : 'Create File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
