// src/hooks/useAppState.js
import { useState, useCallback, useEffect } from "react";
import { getStatus, uploadPDFs } from "../api/client";

export function useAppState() {
  const [activeTab, setActiveTab] = useState("chat");
  const [isReady, setIsReady] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Poll status on mount
  useEffect(() => {
    getStatus()
      .then((data) => {
        setIsReady(data.ready);
        // setUploadedFiles(data.pdfs || []);
        setUploadedFiles([]);
      })
      .catch(() => {}); // backend may not be running yet
  }, []);

  const handleUpload = useCallback(async (files) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const result = await uploadPDFs(files);
      setIsReady(true);
      setUploadedFiles(result.files || []);
      setUploadSuccess(`${result.files.length} PDF(s) processed — ${result.chunks} chunks indexed.`);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    isReady,
    uploadedFiles,
    setUploadedFiles,
    isUploading,
    uploadError,
    uploadSuccess,
    handleUpload,
  };
}