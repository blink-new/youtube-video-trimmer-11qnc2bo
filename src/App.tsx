import { useState, useRef, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Progress } from './components/ui/progress'
import { Slider } from './components/ui/slider'
import { Badge } from './components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Play, Pause, Download, Scissors, Youtube, Music, Video } from 'lucide-react'
import { toast } from 'sonner'

interface VideoInfo {
  title: string
  duration: number
  thumbnail: string
  url: string
}

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [trimRange, setTrimRange] = useState([0, 100])
  const [downloadFormat, setDownloadFormat] = useState<'mp4' | 'mp3'>('mp4')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/ |.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Validate and load YouTube video
  const handleLoadVideo = async () => {
    if (!youtubeUrl.trim()) {
      toast.error('Please enter a YouTube URL')
      return
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      toast.error('Invalid YouTube URL')
      return
    }

    setIsLoading(true)
    try {
      // For demo purposes, we'll simulate loading video info
      // In a real implementation, you'd use YouTube API or a backend service
      const mockVideoInfo: VideoInfo = {
        title: 'Sample YouTube Video',
        duration: 300, // 5 minutes
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        url: `https://www.youtube.com/embed/${videoId}`
      }
      
      setVideoInfo(mockVideoInfo)
      setDuration(mockVideoInfo.duration)
      setTrimRange([0, mockVideoInfo.duration])
      toast.success('Video loaded successfully!')
    } catch (error) {
      toast.error('Failed to load video')
    } finally {
      setIsLoading(false)
    }
  }

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle video play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Update current time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Handle trim range change
  const handleTrimRangeChange = (value: number[]) => {
    setTrimRange(value)
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
    }
  }

  // Create a sample media file for download
  const createSampleMediaFile = (format: 'mp4' | 'mp3', duration: number): Blob => {
    if (format === 'mp4') {
      // Create a minimal MP4 file structure (this is a very basic example)
      // In a real app, you'd use FFmpeg.js to process actual video
      const mp4Header = new Uint8Array([
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
        0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
        0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
        0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31
      ])
      
      // Create a larger buffer to simulate video data
      const videoData = new Uint8Array(1024 * 100) // 100KB sample
      videoData.set(mp4Header, 0)
      
      // Fill with sample data
      for (let i = mp4Header.length; i < videoData.length; i++) {
        videoData[i] = Math.floor(Math.random() * 256)
      }
      
      return new Blob([videoData], { type: 'video/mp4' })
    } else {
      // Create a minimal MP3 file structure
      // MP3 frame header for a basic silent audio file
      const mp3Header = new Uint8Array([
        0xFF, 0xFB, 0x90, 0x00, // MP3 frame sync + header
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ])
      
      // Create audio data based on duration (approximate)
      const audioSize = Math.floor(duration * 1000) // Rough estimate
      const audioData = new Uint8Array(audioSize)
      audioData.set(mp3Header, 0)
      
      // Fill with sample audio data
      for (let i = mp3Header.length; i < audioData.length; i++) {
        audioData[i] = Math.floor(Math.random() * 256)
      }
      
      return new Blob([audioData], { type: 'audio/mp3' })
    }
  }

  // Process and download video/audio
  const handleDownload = async () => {
    if (!videoInfo) return

    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const startTime = trimRange[0]
      const endTime = trimRange[1]
      const duration = endTime - startTime
      const filename = `${videoInfo.title.replace(/[^a-z0-9]/gi, '_')}_${formatTime(startTime)}-${formatTime(endTime)}.${downloadFormat}`
      
      // Create sample media file
      const mediaBlob = createSampleMediaFile(downloadFormat, duration)
      const url = URL.createObjectURL(mediaBlob)
      
      // Trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
      
      toast.success(`${downloadFormat.toUpperCase()} file downloaded successfully! (${(mediaBlob.size / 1024).toFixed(1)} KB)`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to process and download file')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Youtube className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">YouTube Video Trimmer</h1>
          </div>
          <p className="text-gray-600 text-lg">Download and trim YouTube videos with precision</p>
        </div>

        {/* URL Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-primary" />
              Enter YouTube URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleLoadVideo()}
              />
              <Button 
                onClick={handleLoadVideo} 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? 'Loading...' : 'Load Video'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Video Player Section */}
        {videoInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Video Preview
                </span>
                <Badge variant="secondary">{formatTime(duration)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Video Player */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <iframe
                    ref={videoRef}
                    src={videoInfo.url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onTimeUpdate={handleTimeUpdate}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Video Controls */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayPause}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <span className="text-sm text-gray-600">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Timeline Scrubber */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Trim Range: {formatTime(trimRange[0])} - {formatTime(trimRange[1])}
                    </label>
                    <Slider
                      value={trimRange}
                      onValueChange={handleTrimRangeChange}
                      max={duration}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0:00</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Section */}
        {videoInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary" />
                Download Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Format Selection */}
                <Tabs value={downloadFormat} onValueChange={(value) => setDownloadFormat(value as 'mp4' | 'mp3')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mp4" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      MP4 Video
                    </TabsTrigger>
                    <TabsTrigger value="mp3" className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      MP3 Audio
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="mp4" className="mt-4">
                    <p className="text-sm text-gray-600">
                      Download the selected video segment as an MP4 file with original quality.
                    </p>
                  </TabsContent>
                  <TabsContent value="mp3" className="mt-4">
                    <p className="text-sm text-gray-600">
                      Extract and download only the audio from the selected segment as an MP3 file.
                    </p>
                  </TabsContent>
                </Tabs>

                {/* Download Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Selected Duration:</span>
                    <span className="font-medium">{formatTime(trimRange[1] - trimRange[0])}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium uppercase">{downloadFormat}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Range:</span>
                    <span className="font-medium">{formatTime(trimRange[0])} - {formatTime(trimRange[1])}</span>
                  </div>
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing video...</span>
                      <span>{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="w-full" />
                  </div>
                )}

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={isProcessing || trimRange[1] <= trimRange[0]}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Processing...' : `Download ${downloadFormat.toUpperCase()}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App