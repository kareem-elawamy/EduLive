import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taskFilter'
})
export class TaskFilterPipe implements PipeTransform {

  transform(tasks: any[], query: string): any[] {
    if (!query) return tasks;
    return tasks.filter(task =>
      task.courseName?.toLowerCase().includes(query.toLowerCase())
    );
  }

}
