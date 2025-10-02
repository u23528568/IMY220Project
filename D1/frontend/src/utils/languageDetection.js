// Language detection based on file extensions
export const detectLanguagesFromFiles = (files) => {
  if (!files || files.length === 0) return [];
  
  const languageMap = {
    // JavaScript/TypeScript
    'js': 'JavaScript',
    'jsx': 'React',
    'ts': 'TypeScript',
    'tsx': 'TypeScript React',
    'mjs': 'JavaScript',
    
    // Python
    'py': 'Python',
    'pyw': 'Python',
    'pyi': 'Python',
    
    // Java
    'java': 'Java',
    'jar': 'Java',
    'class': 'Java',
    
    // C/C++
    'c': 'C',
    'cpp': 'C++',
    'cxx': 'C++',
    'cc': 'C++',
    'h': 'C/C++',
    'hpp': 'C++',
    'hxx': 'C++',
    
    // C#
    'cs': 'C#',
    'csx': 'C#',
    
    // Go
    'go': 'Go',
    
    // Rust
    'rs': 'Rust',
    
    // PHP
    'php': 'PHP',
    'phtml': 'PHP',
    
    // Ruby
    'rb': 'Ruby',
    'erb': 'Ruby',
    
    // Swift
    'swift': 'Swift',
    
    // Kotlin
    'kt': 'Kotlin',
    'kts': 'Kotlin',
    
    // Scala
    'scala': 'Scala',
    'sc': 'Scala',
    
    // Web Technologies
    'html': 'HTML',
    'htm': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    
    // Shell/Bash
    'sh': 'Shell',
    'bash': 'Bash',
    'zsh': 'Zsh',
    'fish': 'Fish',
    'ps1': 'PowerShell',
    
    // Database
    'sql': 'SQL',
    'mysql': 'MySQL',
    'pgsql': 'PostgreSQL',
    
    // Configuration/Data
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'toml': 'TOML',
    'ini': 'INI',
    'env': 'Environment',
    
    // Documentation
    'md': 'Markdown',
    'markdown': 'Markdown',
    'rst': 'reStructuredText',
    'txt': 'Text',
    
    // Docker
    'dockerfile': 'Docker',
    
    // Makefile
    'makefile': 'Makefile',
    'mk': 'Makefile',
    
    // R
    'r': 'R',
    'rmd': 'R Markdown',
    
    // Matlab
    'm': 'MATLAB',
    
    // Lua
    'lua': 'Lua',
    
    // Perl
    'pl': 'Perl',
    'pm': 'Perl',
    
    // Haskell
    'hs': 'Haskell',
    
    // Clojure
    'clj': 'Clojure',
    'cljs': 'ClojureScript',
    
    // Erlang/Elixir
    'erl': 'Erlang',
    'ex': 'Elixir',
    'exs': 'Elixir',
    
    // Assembly
    'asm': 'Assembly',
    's': 'Assembly',
    
    // Dart
    'dart': 'Dart',
    
    // F#
    'fs': 'F#',
    'fsx': 'F#',
    
    // Visual Basic
    'vb': 'Visual Basic',
    
    // Objective-C
    'mm': 'Objective-C++',
    'objc': 'Objective-C'
  };

  const detectedLanguages = new Set();

  files.forEach(file => {
    if (file.type === 'file' && file.name) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      // Handle special cases
      if (file.name.toLowerCase() === 'dockerfile' || file.name.toLowerCase() === 'dockerfile.dev') {
        detectedLanguages.add('Docker');
      } else if (file.name.toLowerCase() === 'makefile') {
        detectedLanguages.add('Makefile');
      } else if (file.name.toLowerCase() === 'readme.md' || file.name.toLowerCase() === 'readme') {
        // Don't add markdown tag just for README
        return;
      } else if (extension && languageMap[extension]) {
        detectedLanguages.add(languageMap[extension]);
      }
    }
  });

  return Array.from(detectedLanguages).sort();
};

// Get color for language tag
export const getLanguageColor = (language) => {
  const colorMap = {
    'JavaScript': 'bg-yellow-600',
    'TypeScript': 'bg-blue-600',
    'React': 'bg-cyan-600',
    'TypeScript React': 'bg-blue-500',
    'Python': 'bg-green-600',
    'Java': 'bg-orange-600',
    'C': 'bg-gray-600',
    'C++': 'bg-blue-700',
    'C/C++': 'bg-gray-700',
    'C#': 'bg-purple-600',
    'Go': 'bg-teal-600',
    'Rust': 'bg-orange-700',
    'PHP': 'bg-indigo-600',
    'Ruby': 'bg-red-600',
    'Swift': 'bg-orange-500',
    'Kotlin': 'bg-purple-500',
    'Scala': 'bg-red-700',
    'HTML': 'bg-orange-500',
    'CSS': 'bg-blue-500',
    'SCSS': 'bg-pink-600',
    'Sass': 'bg-pink-500',
    'Less': 'bg-blue-400',
    'Shell': 'bg-gray-800',
    'Bash': 'bg-gray-800',
    'PowerShell': 'bg-blue-800',
    'SQL': 'bg-blue-600',
    'JSON': 'bg-gray-600',
    'XML': 'bg-orange-400',
    'YAML': 'bg-red-500',
    'Markdown': 'bg-gray-500',
    'Docker': 'bg-blue-700',
    'Makefile': 'bg-green-700',
    'R': 'bg-blue-600',
    'MATLAB': 'bg-orange-600',
    'Lua': 'bg-blue-800',
    'Perl': 'bg-blue-900',
    'Haskell': 'bg-purple-700',
    'Clojure': 'bg-green-700',
    'Erlang': 'bg-red-800',
    'Elixir': 'bg-purple-800',
    'Assembly': 'bg-gray-900',
    'Dart': 'bg-teal-500',
    'F#': 'bg-blue-800',
    'Visual Basic': 'bg-blue-600',
    'Objective-C': 'bg-blue-700',
    'Objective-C++': 'bg-blue-800'
  };

  return colorMap[language] || 'bg-gray-500';
};