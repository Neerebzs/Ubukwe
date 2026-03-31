"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Search,
  Filter,
  Star,
  Share2,
  Download,
  Bookmark,
  Palette,
  Camera,
  Flower2,
  Crown,
  Sparkles,
  Eye,
  ThumbsUp
} from "lucide-react";
import { useState } from "react";

interface InspirationItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
  likes: number;
  views: number;
  isBookmarked: boolean;
  photographer?: string;
  venue?: string;
  colorPalette?: string[];
}

export function WeddingInspiration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);

  const inspirationItems: InspirationItem[] = [
    {
      id: "1",
      title: "Traditional Rwandan Ceremony",
      category: "Ceremony",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
      description: "Beautiful traditional Rwandan wedding ceremony with Intore dancers and cultural elements.",
      tags: ["Traditional", "Cultural", "Intore", "Rwandan"],
      likes: 124,
      views: 2340,
      isBookmarked: false,
      photographer: "Jean Baptiste Photography",
      venue: "Kigali Cultural Center",
      colorPalette: ["#660033", "#DAA520", "#228B22", "#FFFFFF"]
    },
    {
      id: "2",
      title: "Modern Garden Wedding",
      category: "Reception",
      image: "https://images.unsplash.com/photo-1519225421980-619bd200963b?auto=format&fit=crop&q=80&w=800",
      description: "Elegant garden wedding with modern touches and beautiful floral arrangements.",
      tags: ["Modern", "Garden", "Floral", "Outdoor"],
      likes: 89,
      views: 1890,
      isBookmarked: true,
      photographer: "Grace Photography",
      venue: "Lake Kivu Resort",
      colorPalette: ["#90EE90", "#FFB6C1", "#87CEEB", "#F0E68C"]
    },
    {
      id: "3",
      title: "Luxury Hotel Reception",
      category: "Reception",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      description: "Sophisticated luxury hotel wedding with elegant decor and premium amenities.",
      tags: ["Luxury", "Hotel", "Elegant", "Indoor"],
      likes: 156,
      views: 3120,
      isBookmarked: false,
      photographer: "Paul Studio",
      venue: "Kigali Serena Hotel",
      colorPalette: ["#000000", "#FFFFFF", "#FFD700", "#C0C0C0"]
    },
    {
      id: "4",
      title: "Cultural Dance Performance",
      category: "Entertainment",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800",
      description: "Stunning Intore cultural dance performance during wedding celebration.",
      tags: ["Cultural", "Dance", "Performance", "Traditional"],
      likes: 203,
      views: 4560,
      isBookmarked: true,
      photographer: "Rwandan Arts Photography",
      colorPalette: ["#660033", "#FFD700", "#000000", "#FFFFFF"]
    },
    {
      id: "5",
      title: "Mountain View Ceremony",
      category: "Ceremony",
      image: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=80&w=800",
      description: "Breathtaking mountain view ceremony with natural beauty as backdrop.",
      tags: ["Mountain", "Scenic", "Outdoor", "Natural"],
      likes: 178,
      views: 2890,
      isBookmarked: false,
      photographer: "Mountain View Studio",
      venue: "Musanze Resort",
      colorPalette: ["#228B22", "#660033", "#87CEEB", "#FFFFFF"]
    },
    {
      id: "6",
      title: "Traditional Attire Showcase",
      category: "Fashion",
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
      description: "Beautiful traditional Rwandan wedding attire and cultural costumes.",
      tags: ["Traditional", "Attire", "Cultural", "Fashion"],
      likes: 145,
      views: 2230,
      isBookmarked: false,
      photographer: "Cultural Fashion Studio",
      colorPalette: ["#660033", "#DAA520", "#660033", "#FFFFFF"]
    }
  ];

  const filteredItems = inspirationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    const matchesStyle = selectedStyle === "all" ||
      (selectedStyle === "traditional" && item.tags.includes("Traditional")) ||
      (selectedStyle === "modern" && item.tags.includes("Modern")) ||
      (selectedStyle === "luxury" && item.tags.includes("Luxury"));

    return matchesSearch && matchesCategory && matchesStyle;
  });

  const toggleBookmark = (itemId: string) => {
    setBookmarkedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const categories = ["all", "Ceremony", "Reception", "Entertainment", "Fashion", "Decor"];
  const styles = ["all", "traditional", "modern", "luxury"];

  return (
    <div className="space-y-12">
      {/* Header - Editorial Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div>
          <h2 className="text-4xl font-serif italic text-slate-800 leading-tight">Editorial Inspiration</h2>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sage-600 mt-3">A Bespoke Gallery of Visionary Concepts</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 hover:border-sage-100 hover:bg-sage-50/30 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all">
            <Bookmark className="w-4 h-4 mr-3 text-sage-600" />
            Saved Curations ({bookmarkedItems.length})
          </Button>
          <Button className="h-14 px-8 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95">
            <Share2 className="w-4 h-4 mr-3" />
            Share Portfolio
          </Button>
        </div>
      </div>

      {/* Boutique Search and Filters */}
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] overflow-hidden bg-white">
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-2 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search the Archive</span>
              <div className="relative group">
                <Search className="absolute left-5 top-4 h-4 w-4 text-slate-300 group-focus-within:text-sage-500 transition-colors" />
                <Input
                  placeholder="Atmosphere, color, or aesthetic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14 h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-sage-500/20 text-sm font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-sage-500/20 text-sm font-bold text-slate-700">
                  <SelectValue placeholder="All Chapters" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="rounded-xl py-3 text-sm font-medium">
                      {category === "all" ? "All Chapters" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="h-14 rounded-2xl border-slate-100 hover:border-sage-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all">
              <Filter className="w-4 h-4 mr-3" />
              Sophisticated Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Visual Filters */}
      <div className="flex flex-wrap gap-3 px-2">
        {[
          { icon: Crown, label: "Heritage", value: "traditional" },
          { icon: Sparkles, label: "Contemporary", value: "modern" },
          { icon: Star, label: "Opulent", value: "luxury" },
          { icon: Flower2, label: "Botanical", value: "floral" },
          { icon: Palette, label: "Chromatics", value: "palettes" }
        ].map((tag) => (
          <Button
            key={tag.label}
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStyle(tag.value)}
            className={`h-11 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedStyle === tag.value
              ? "bg-sage-600 text-white shadow-lg shadow-sage-600/20"
              : "bg-white text-slate-500 hover:bg-slate-50 shadow-sm border border-slate-50"
              }`}
          >
            <tag.icon className={`w-3.5 h-3.5 mr-2.5 ${selectedStyle === tag.value ? "text-white" : "text-sage-600"}`} />
            {tag.label}
          </Button>
        ))}
      </div>

      {/* Inspiration Grid - Precision Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredItems.map((item) => {
          const isBookmarked = bookmarkedItems.includes(item.id);
          return (
            <Card key={item.id} className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)] rounded-[2.5rem] overflow-hidden bg-white transition-all duration-700 group border border-transparent hover:border-sage-50">
              <div className="relative aspect-[11/14] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/40 transition-colors duration-700" />

                {/* Upper Actions */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                  <Button
                    size="icon"
                    className={`h-12 w-12 rounded-2xl shadow-2xl transition-all duration-300 ${isBookmarked ? "bg-sage-600 text-white" : "bg-white text-slate-400 hover:text-sage-600"
                      }`}
                    onClick={() => toggleBookmark(item.id)}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                  </Button>
                  <Button size="icon" className="h-12 w-12 bg-white text-slate-400 hover:text-sage-600 rounded-2xl shadow-2xl transition-all">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                {/* Chapter Tag */}
                <div className="absolute top-6 left-6">
                  <Badge className="bg-white/90 backdrop-blur-md text-slate-800 border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                    {item.category}
                  </Badge>
                </div>

                {/* Bottom Metadata - Glassmorphism */}
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="space-y-4">
                    {item.colorPalette && (
                      <div className="flex gap-2">
                        {item.colorPalette.map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp className="w-3 h-3 text-sage-400" />
                          <span className="text-[10px] font-bold tracking-widest">{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3 h-3 text-white/60" />
                          <span className="text-[10px] font-bold tracking-widest">{item.views}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold tracking-widest">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-[1px] bg-sage-600/30" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-sage-600/80">Premium Curation</span>
                </div>
                <h3 className="text-xl font-serif italic text-slate-800 mb-3 group-hover:text-sage-700 transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Camera className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Creative Lens</span>
                      <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{item.photographer || "Anonymous Artist"}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-sage-600 hover:bg-sage-50 rounded-xl transition-all">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results - Editorial Design */}
      {filteredItems.length === 0 && (
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] bg-white overflow-hidden py-20">
          <CardContent className="text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-slate-100">
              <Sparkles className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-serif italic text-slate-800 mb-4">A Theoretical Vision</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">
              Your specific aesthetic criteria has yielded no immediate results. Consider broadening your strategic parameters.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedStyle("all");
              }}
              variant="outline"
              className="h-14 px-10 rounded-2xl border-slate-100 hover:border-sage-100 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all active:scale-95"
            >
              Reset Archive Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Load More - Premium Call to Action */}
      <div className="text-center pt-10 pb-20">
        <Button variant="outline" className="h-16 px-16 rounded-[2rem] border-slate-100 hover:border-sage-100 hover:bg-sage-50 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 shadow-sm transition-all active:scale-95 group">
          Expand Collection
          <Download className="w-4 h-4 ml-4 group-hover:translate-y-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
