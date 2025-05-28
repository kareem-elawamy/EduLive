namespace EduLive.Service
{
    public interface IImageService
    {
        Task<string> SaveImageAsync(IFormFile imageFile, string folderName);

        Task DeleteImageAsync(string relativePath);

    }
}
