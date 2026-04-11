"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Image as ImageIcon, FileText } from "lucide-react"

export function AssetLibrary() {
  const [photos, setPhotos] = useState<File[]>([])
  const [docs, setDocs] = useState<File[]>([])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="photos">
            <TabsList>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="photos" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input type="file" id="photoUpload" accept="image/*" multiple className="hidden"
                  onChange={(e) => e.target.files && setPhotos([...photos, ...Array.from(e.target.files)])} />
                <label htmlFor="photoUpload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">Click to upload or drag and drop</p>
                </label>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="aspect-video bg-muted rounded flex items-center justify-center text-xs">
                      <ImageIcon className="w-4 h-4 mr-1" /> {p.name}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="documents" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input type="file" id="docUpload" accept=".pdf,.doc,.docx" multiple className="hidden"
                  onChange={(e) => e.target.files && setDocs([...docs, ...Array.from(e.target.files)])} />
                <label htmlFor="docUpload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">Upload documents</p>
                </label>
              </div>
              {docs.length > 0 && (
                <div className="space-y-2">
                  {docs.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" /> {d.name}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


