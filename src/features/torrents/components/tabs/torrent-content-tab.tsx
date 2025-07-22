import { ChevronDown, ChevronRight, Edit, File, Folder, FolderOpen, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { toast } from 'sonner';
import type { TorrentFile, TorrentInfo } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { formatBytes, formatProgress } from '@/lib/utils';

interface TorrentContentTabProps {
  torrent: TorrentInfo;
  files: Array<TorrentFile>;
  onRefresh: () => void;
}

interface FileNode {
  name: string;
  path: string;
  size: number;
  progress: number;
  priority: number;
  index?: number;
  isDirectory: boolean;
  children: Array<FileNode>;
  isExpanded: boolean;
}

const PRIORITY_LABELS = {
  0: 'Do not download',
  1: 'Normal',
  6: 'High',
  7: 'Maximum',
};

const PRIORITY_COLORS = {
  0: 'bg-gray-500',
  1: 'bg-blue-500',
  6: 'bg-orange-500',
  7: 'bg-red-500',
};

export function TorrentContentTab({
  files,
  onRefresh,
}: TorrentContentTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renamingFile, setRenamingFile] = useState<TorrentFile | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Build file tree from flat file list
  const fileTree = useMemo(() => {
    const root: FileNode = {
      name: 'Root',
      path: '',
      size: 0,
      progress: 0,
      priority: 1,
      isDirectory: true,
      children: [],
      isExpanded: true,
    };

    files.forEach((file) => {
      const pathParts = file.name.split('/');
      let currentNode = root;

      pathParts.forEach((part, index) => {
        const isLastPart = index === pathParts.length - 1;
        const currentPath = pathParts.slice(0, index + 1).join('/');

        let existingChild = currentNode.children.find(
          (child) => child.name === part,
        );

        if (!existingChild) {
          existingChild = {
            name: part,
            path: currentPath,
            size: isLastPart ? file.size : 0,
            progress: isLastPart ? file.progress : 0,
            priority: isLastPart ? file.priority : 1,
            index: isLastPart ? file.index : undefined,
            isDirectory: !isLastPart,
            children: [],
            isExpanded: expandedNodes.has(currentPath),
          };
          currentNode.children.push(existingChild);
        } else if (isLastPart) {
          // Update file info
          existingChild.size = file.size;
          existingChild.progress = file.progress;
          existingChild.priority = file.priority;
          existingChild.index = file.index;
        }

        currentNode = existingChild;
      });
    });

    // Calculate directory sizes and progress
    const calculateDirectoryStats = (node: FileNode): void => {
      if (node.isDirectory) {
        let totalSize = 0;
        let totalProgress = 0;
        let fileCount = 0;

        node.children.forEach((child) => {
          calculateDirectoryStats(child);
          if (!child.isDirectory) {
            totalSize += child.size;
            totalProgress += child.progress * child.size;
            fileCount++;
          } else {
            totalSize += child.size;
            totalProgress += child.progress * child.size;
          }
        });

        node.size = totalSize;
        node.progress = totalSize > 0 ? totalProgress / totalSize : 0;
      }
    };

    calculateDirectoryStats(root);
    return root;
  }, [files, expandedNodes]);

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSetPriority = async (
    _fileIndexes: Array<number>,
    _priority: number,
  ) => {
    try {
      setIsLoading(true);

      // Note: This would need to be implemented in the API client
      toast.info(
        'Set file priority functionality needs to be implemented in the API client',
      );

      onRefresh();
    } catch (error) {
      console.error('Failed to set file priority:', error);
      toast.error('Failed to set file priority');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFile = async () => {
    if (!renamingFile || !newFileName.trim()) return;

    try {
      setIsLoading(true);

      // Note: This would need to be implemented in the API client
      toast.info(
        'Rename file functionality needs to be implemented in the API client',
      );

      setNewFileName('');
      setRenamingFile(null);
      setIsRenameDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to rename file:', error);
      toast.error('Failed to rename file');
    } finally {
      setIsLoading(false);
    }
  };

  const openRenameDialog = (file: TorrentFile) => {
    setRenamingFile(file);
    setNewFileName(file.name.split('/').pop() || '');
    setIsRenameDialogOpen(true);
  };

  const renderFileNode = (
    node: FileNode,
    depth: number = 0,
  ): React.ReactNode => {
    const isVisible =
      !searchTerm ||
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.children.some((child) =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    if (!isVisible) return null;

    const paddingLeft = depth * 20;

    return (
      <div key={node.path}>
        <div
          className='hover:bg-muted/50 flex cursor-pointer items-center px-2 py-2'
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
        >
          {node.isDirectory ? (
            <div
              className='flex flex-1 items-center'
              onClick={() => toggleExpanded(node.path)}
            >
              {node.isExpanded ? (
                <ChevronDown className='mr-1 h-4 w-4' />
              ) : (
                <ChevronRight className='mr-1 h-4 w-4' />
              )}
              {node.isExpanded ? (
                <FolderOpen className='mr-2 h-4 w-4 text-blue-500' />
              ) : (
                <Folder className='mr-2 h-4 w-4 text-blue-500' />
              )}
              <span className='font-medium'>{node.name}</span>
            </div>
          ) : (
            <div className='flex flex-1 items-center'>
              <div className='mr-1 w-5' />
              {/* Spacer for alignment */}
              <File className='mr-2 h-4 w-4 text-gray-500' />
              <span>{node.name.split('/').pop()}</span>
            </div>
          )}

          <div className='ml-4 flex items-center space-x-4'>
            <div className='w-32'>
              <div className='flex items-center space-x-2'>
                <Progress value={node.progress * 100} className='h-2 flex-1' />
                <span className='w-12 text-right text-xs'>
                  {formatProgress(node.progress)}
                </span>
              </div>
            </div>

            <div className='w-20 text-right text-sm'>
              {formatBytes(node.size)}
            </div>

            {!node.isDirectory && (
              <>
                <div className='w-24'>
                  <Select
                    value={node.priority.toString()}
                    onValueChange={(value) => {
                      if (node.index !== undefined) {
                        handleSetPriority([node.index], parseInt(value));
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className='h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className='flex items-center space-x-2'>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                PRIORITY_COLORS[
                                  parseInt(
                                    value,
                                  ) as keyof typeof PRIORITY_COLORS
                                ]
                              }`}
                            />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => {
                    const file = files.find((f) => f.index === node.index);
                    if (file) openRenameDialog(file);
                  }}
                  disabled={isLoading}
                >
                  <Edit className='h-3 w-3' />
                </Button>
              </>
            )}
          </div>
        </div>

        {node.isDirectory && node.isExpanded && (
          <div>
            {node.children.map((child) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const stats = useMemo(() => {
    const totalFiles = files.length;
    const completedFiles = files.filter((f) => f.progress >= 1).length;
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const downloadedSize = files.reduce(
      (sum, f) => sum + f.size * f.progress,
      0,
    );

    return {
      totalFiles,
      completedFiles,
      totalSize,
      downloadedSize,
      progress: totalSize > 0 ? downloadedSize / totalSize : 0,
    };
  }, [files]);

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div>
              <p className='text-2xl font-bold'>{stats.totalFiles}</p>
              <p className='text-muted-foreground text-xs'>Total Files</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div>
              <p className='text-2xl font-bold'>{stats.completedFiles}</p>
              <p className='text-muted-foreground text-xs'>Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div>
              <p className='text-2xl font-bold'>
                {formatBytes(stats.totalSize)}
              </p>
              <p className='text-muted-foreground text-xs'>Total Size</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div>
              <p className='text-2xl font-bold'>
                {formatProgress(stats.progress)}
              </p>
              <p className='text-muted-foreground text-xs'>Overall Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Tree */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>Files</CardTitle>
            <div className='flex items-center space-x-2'>
              <div className='relative'>
                <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                <Input
                  placeholder='Search files...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-64 pl-8'
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>
              No files found
            </div>
          ) : (
            <div className='rounded-md border'>
              <div className='bg-muted/50 border-b px-4 py-2'>
                <div className='flex items-center justify-between text-sm font-medium'>
                  <span>Name</span>
                  <div className='flex items-center space-x-4'>
                    <span className='w-32 text-center'>Progress</span>
                    <span className='w-20 text-right'>Size</span>
                    <span className='w-24 text-center'>Priority</span>
                    <span className='w-8'></span>
                  </div>
                </div>
              </div>
              <div className='max-h-96 overflow-y-auto'>
                {fileTree.children.map((child) => renderFileNode(child, 0))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>New filename</label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder='Enter new filename'
                className='mt-1'
              />
            </div>
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => setIsRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenameFile}
                disabled={!newFileName.trim() || isLoading}
              >
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
