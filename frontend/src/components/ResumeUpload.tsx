"use client";

import { useState } from "react";
import { api } from "@/service/api";
import { useInterviewStore } from "@/store/interviewStore";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    setProfile,
    setCurrentQuestion,
  } = useInterviewStore();

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post(
        "/upload-resume",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setProfile(
        response.data.profile
      );

      setCurrentQuestion(
        response.data.question
      );

      router.push("/interview");
    } catch (error: any) {
  console.error("FULL ERROR:", error);

  if (error.response) {
    console.log(error.response.data);
  }

  alert(error.message);
}

    setLoading(false);
  };

  return (
    <Card className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">
        CAT AI Interviewer
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(
            e.target.files?.[0] || null
          )
        }
      />

      <Button
        onClick={handleUpload}
        disabled={loading}
      >
        {loading
          ? "Processing..."
          : "Start Interview"}
      </Button>
    </Card>
  );
}