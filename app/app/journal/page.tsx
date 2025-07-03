
'use client'

import { useState, useEffect } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/journal/rich-text-editor"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  Plus, 
  Calendar, 
  Tag, 
  Save, 
  Trash2, 
  FileText,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface JournalEntry {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  
  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetchEntries()
  }, [searchQuery, tagFilter])

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (tagFilter) params.append('tag', tagFilter)
      
      const response = await fetch(`/api/journal?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
        
        // Extract all unique tags
        const tags = new Set<string>()
        data.forEach((entry: JournalEntry) => {
          entry.tags?.forEach(tag => tags.add(tag))
        })
        setAllTags(Array.from(tags))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch journal entries",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startNewEntry = () => {
    setIsCreating(true)
    setSelectedEntry(null)
    setTitle("")
    setContent("")
    setCurrentTags([])
  }

  const selectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsCreating(false)
    setTitle(entry.title)
    setContent(entry.content)
    setCurrentTags(entry.tags || [])
  }

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags([...currentTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove))
  }

  const saveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const url = selectedEntry ? `/api/journal/${selectedEntry.id}` : '/api/journal'
      const method = selectedEntry ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          tags: currentTags,
          encrypt: true
        }),
      })

      if (response.ok) {
        const savedEntry = await response.json()
        
        if (selectedEntry) {
          setEntries(entries.map(entry => 
            entry.id === selectedEntry.id ? savedEntry : entry
          ))
          setSelectedEntry(savedEntry)
        } else {
          setEntries([savedEntry, ...entries])
          setSelectedEntry(savedEntry)
          setIsCreating(false)
        }

        toast({
          title: "Success",
          description: selectedEntry ? "Entry updated" : "Entry created",
        })
      } else {
        throw new Error('Failed to save entry')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async () => {
    if (!selectedEntry) return

    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`/api/journal/${selectedEntry.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== selectedEntry.id))
        setSelectedEntry(null)
        setTitle("")
        setContent("")
        setCurrentTags([])
        
        toast({
          title: "Success",
          description: "Entry deleted",
        })
      } else {
        throw new Error('Failed to delete entry')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-muted rounded"></div>
              <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Journal</h1>
            <p className="text-muted-foreground">Document your thoughts and experiences</p>
          </div>
          <Button onClick={startNewEntry} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entries List */}
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={tagFilter === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTagFilter("")}
                  >
                    All
                  </Button>
                  {allTags.slice(0, 5).map(tag => (
                    <Button
                      key={tag}
                      variant={tagFilter === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTagFilter(tag === tagFilter ? "" : tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Entries */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {entries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No entries found</p>
                    <Button onClick={startNewEntry} className="mt-4">
                      Create your first entry
                    </Button>
                  </motion.div>
                ) : (
                  entries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          selectedEntry?.id === entry.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => selectEntry(entry)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base line-clamp-2">
                            {entry.title}
                          </CardTitle>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(entry.createdAt)}
                          </div>
                        </CardHeader>
                        {entry.tags && entry.tags.length > 0 && (
                          <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-1">
                              {entry.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                                >
                                  <Tag className="mr-1 h-2 w-2" />
                                  {tag}
                                </span>
                              ))}
                              {entry.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{entry.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {(selectedEntry || isCreating) ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Input
                          placeholder="Entry title..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                        />
                        {selectedEntry && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Last updated: {formatDate(selectedEntry.updatedAt)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={saveEntry}
                          disabled={isSaving}
                          size="sm"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        {selectedEntry && (
                          <Button
                            onClick={deleteEntry}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {currentTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            <Tag className="mr-1 h-2 w-2" />
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          className="flex-1"
                          size={30}
                        />
                        <Button onClick={addTag} size="sm" variant="outline">
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Start writing your thoughts..."
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center">
                  <FileText className="mx-auto h-24 w-24 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Select an entry to edit
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Choose an entry from the list or create a new one
                  </p>
                  <Button onClick={startNewEntry}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Entry
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
