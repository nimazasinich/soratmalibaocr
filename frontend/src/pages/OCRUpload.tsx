import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const OCRUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setOcrResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('لطفاً یک فایل انتخاب کنید');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', 'fas+eng');

      const response = await fetch('/api/ocr/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setOcrResult(result.data);
        toast.success('فایل با موفقیت پردازش شد!');
      } else {
        toast.error('خطا در پردازش فایل');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">آپلود صورت مالی</h1>
        <p className="text-gray-600 mt-1">با استفاده از OCR متن را از تصویر استخراج کنید</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            انتخاب فایل
          </h2>

          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <label className="block">
                <span className="sr-only">انتخاب فایل</span>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG, PDF تا 10MB
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  حذف
                </button>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  در حال پردازش...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  شروع پردازش OCR
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            نتیجه پردازش
          </h2>

          {!ocrResult && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>هنوز فایلی پردازش نشده است</p>
            </div>
          )}

          {ocrResult && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      اطمینان
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {(ocrResult.ocrResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      زمان پردازش
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {ocrResult.ocrResult.processingTime.toFixed(1)}s
                  </p>
                </div>
              </div>

              {/* Extracted Text */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  متن استخراج شده:
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-vazir">
                    {ocrResult.ocrResult.text}
                  </pre>
                </div>
              </div>

              {/* Parsed Financial Data */}
              {ocrResult.parsedData &&
                Object.keys(ocrResult.parsedData).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      داده‌های مالی شناسایی شده:
                    </h3>
                    <div className="p-4 bg-green-50 rounded-lg space-y-2">
                      {Object.entries(ocrResult.parsedData).map(
                        ([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-gray-700">{key}:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {value?.toLocaleString('fa-IR')}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRUpload;
