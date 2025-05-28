
namespace EduLive.Service
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _evn;
        public ImageService(IWebHostEnvironment evn)
        {
            _evn = evn;
        }
        public async Task<string> SaveImageAsync(IFormFile imageFile ,  string folderName)
        {
            if (imageFile ==null||string.IsNullOrEmpty(folderName))
            {
                throw new ArgumentException("Image file is invalid");
            }
            //اسم الملف امن
            var safeFileName=Path.GetFileName(imageFile.FileName);
            var fileName = $"{Guid.NewGuid()}_{safeFileName}";
            // أنشئ المسار الكامل
            var folderPath = Path.Combine(_evn.WebRootPath, folderName);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            var filePath = Path.Combine(folderPath, fileName);

            // احفظ الصورة
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }
            return $"/{folderName}/{fileName}";

        }
        public async Task DeleteImageAsync(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
                return;

            var fullPath = Path.Combine(_evn.WebRootPath, relativePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
            }
        }


    }
}
