import { TestBed } from '@angular/core/testing';
import { MenufilterService } from './menufilter-service';

describe('MenufilterService', () => {
  let service: MenufilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenufilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
