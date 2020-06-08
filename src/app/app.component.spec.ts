import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        HttpClientTestingModule,
      ],
      declarations: [AppComponent],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  }));

  it('can be created', () => {
    expect(component).toBeDefined();
    expect(component).not.toBeNull();
  });

  describe('when rendering for the first time', () => {
    beforeEach(async(() => {
      component.ngOnInit();
      fixture.detectChanges();
    }));

    it('shows the title', () => {
      const branding = fixture.debugElement.query(By.css('h1'));
      expect(branding.nativeElement.innerText).toEqual(
        'Demo: Retry on Internal Server Error'
      );
    });
  });
});
