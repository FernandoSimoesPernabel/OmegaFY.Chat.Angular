import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading-overlay',
    imports: [MatProgressSpinnerModule],
    templateUrl: './loading-overlay.component.html',
    styleUrl: './loading-overlay.component.css',
})
export class LoadingOverlayComponent { }