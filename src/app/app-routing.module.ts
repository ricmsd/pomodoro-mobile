import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pomodoro',
    pathMatch: 'full'
  },
  {
    path: 'pomodoro',
    loadChildren: () => import('./pomodoro/pomodoro.module').then( m => m.PomodoroPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
