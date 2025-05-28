using System.ComponentModel.DataAnnotations.Schema;

namespace EduLive.Models
{
    public class Degree
    {
        public int Id { get; set; }
        public int SubmitDegree { get; set; }
        public int SubmitId { get; set; }
        [ForeignKey(nameof(SubmitId))]
        public SubmitTask SubmitTask { get; set; }
    }
}
