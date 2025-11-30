import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
  rules: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.getRules('team-1').subscribe((r) => (this.rules = r));
  }
}
