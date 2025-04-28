import { MessageSquare, Heart, Share2, Bookmark } from "lucide-react"

interface SocialViewProps {
  channelId: string
}

interface Post {
  id: string
  author: string
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
}

export default function SocialView({ channelId }: SocialViewProps) {
  // Mock data for social posts
  const posts: Post[] = [
    {
      id: "1",
      author: "Jane Smith",
      content: "Just launched our new product! Check it out at example.com #newlaunch #product",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 5,
      shares: 3,
    },
    {
      id: "2",
      author: "Tech News",
      content:
        "Breaking: New AI breakthrough allows computers to understand context better than ever before. #AI #technology",
      timestamp: "5 hours ago",
      likes: 132,
      comments: 28,
      shares: 47,
    },
    {
      id: "3",
      author: "John Doe",
      content: "Beautiful day for hiking! 🏔️ #outdoors #nature #weekend",
      timestamp: "Yesterday",
      likes: 87,
      comments: 12,
      shares: 4,
    },
  ]

  // Determine which platform is being viewed
  const getPlatformName = () => {
    if (channelId === "instagram") return "Instagram"
    if (channelId === "facebook") return "Facebook"
    if (channelId === "youtube") return "YouTube"
    if (channelId.includes("slack")) return "Slack"
    if (channelId.includes("zendesk")) return "Zendesk"
    if (channelId.includes("airtable")) return "Airtable"
    return channelId.replace("#", "")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{getPlatformName()} Feed</h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{post.author}</div>
              <div className="text-sm text-gray-500">{post.timestamp}</div>
            </div>
            <p className="mb-4">{post.content}</p>
            <div className="flex justify-between text-gray-500 text-sm">
              <button className="flex items-center gap-1 hover:text-gray-700">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-700">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-700">
                <Share2 className="h-4 w-4" />
                <span>{post.shares}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-700">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
