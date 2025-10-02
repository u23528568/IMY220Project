import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/ApiService';
import { formatDateToCAT } from '../utils/timezone';

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
  const [editingFile, setEditingFile] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [hoveredFile, setHoveredFile] = useState(null);

  const isOwner = project?.owner?._id === user?.id;
  const isCollaborator = project?.members?.some(member => {
    // Handle both cases: member.user as object or member.user as string
    const memberId = typeof member.user === 'object' ? member.user._id : member.user;
    return memberId === user?.id;
  }) || false;
  const canEdit = isOwner || isCollaborator;

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
    if (fileType === 'folder') return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H13.19a2.25 2.25 0 0 1-1.597-.659Z" />
      </svg>
    );
    
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

  const handleEditFile = async (file) => {
    try {
      setLoading(true);
      const fileData = await ApiService.getFileContent(project._id, file._id);
      setEditingFile(file);
      // The API returns { file } so we need to access fileData.file.content
      setEditContent(fileData.file?.content || file.content || '');
      setEditName(file.name);
    } catch (err) {
      setError(err.message || 'Failed to load file content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;

    setLoading(true);
    setError(null);

    try {
      const updates = {
        content: editContent,
        name: editName
      };
      
      await ApiService.updateFile(project._id, editingFile._id, updates);
      setEditingFile(null);
      setEditContent('');
      setEditName('');
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      setError(err.message || 'Failed to save file');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (file) => {
    setLoading(true);
    setError(null);

    try {
      await ApiService.deleteFile(project._id, file._id);
      setShowDeleteConfirm(null);
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      setError(err.message || 'Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const isTextFile = (fileName) => {
    return ['md', 'txt', 'js', 'jsx', 'html', 'css', 'json', 'py', 'java', 'xml', 'yml', 'yaml', 'ts', 'tsx'].includes(
      fileName.split('.').pop()?.toLowerCase()
    );
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
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowUpload(true)}
              className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-sm flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <span>Upload</span>
            </button>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm flex items-center space-x-2"
              title="Create folder"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setShowCreateFile(true)}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm flex items-center space-x-2"
              title="Create file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span>New File</span>
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
                  onMouseEnter={() => setHoveredFile(file._id)}
                  onMouseLeave={() => setHoveredFile(null)}
                  className={`flex items-center justify-between p-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 ${
                    selectedFile?.name === file.name ? 'bg-gray-700' : ''
                  }`}
                >
                  <div 
                    onClick={() => handleFileClick(file)}
                    className="flex items-center flex-1 min-w-0 cursor-pointer"
                  >
                    <span className="mr-3 text-lg">{getFileIcon(file.name, file.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white truncate">{file.name}</p>
                      <p className="text-gray-400 text-xs">
                        {file.type === 'file' ? formatFileSize(file.size || file.content?.length || 0) : 'Folder'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-gray-400 text-xs mr-2">
                      {formatDateToCAT(file.updatedAt || file.createdAt)}
                    </div>
                    
                    {/* Action buttons - show for owners and collaborators on hover */}
                    {canEdit && hoveredFile === file._id && (
                      <div className="flex space-x-1">
                        {file.type === 'file' && isTextFile(file.name) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFile(file);
                            }}
                            className="p-1 text-gray-400 hover:text-orange-400 hover:bg-gray-600 rounded"
                            title="Edit file"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                              <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(file);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                          title="Delete file"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">
                <p className="mb-2">📭 No files in this directory</p>
                {canEdit && (
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

      {/* Edit File Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Edit File: {editingFile.name}
            </h3>
            
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">File Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                disabled={loading}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 min-h-[500px] px-4 py-3 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-white font-mono text-sm resize-none"
                disabled={loading}
                placeholder="Enter file content..."
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingFile(null);
                  setEditContent('');
                  setEditName('');
                  setError(null);
                }}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded"
                disabled={loading || !editName.trim()}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-400">
              Delete {showDeleteConfirm.type === 'folder' ? 'Folder' : 'File'}
            </h3>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{showDeleteConfirm.name}"?
              {showDeleteConfirm.type === 'folder' && (
                <span className="block text-yellow-400 text-sm mt-2">
                  Warning: This will also delete all files inside this folder.
                </span>
              )}
              <span className="block text-gray-400 text-sm mt-2">
                This action cannot be undone.
              </span>
            </p>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(null);
                  setError(null);
                }}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(showDeleteConfirm)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
