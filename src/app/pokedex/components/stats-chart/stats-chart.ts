// src/app/pokedex/components/stats-chart/stats-chart.ts

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
// FIX: Import the directive instead of the module
import { BaseChartDirective } from 'ng2-charts';
import { PokemonStat } from '../../interfaces/pokemon.model';

@Component({
  selector: 'app-stats-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './stats-chart.html',
  styleUrl: './stats-chart.css'
})
export default class StatsChart implements OnInit {
  @Input() stats: PokemonStat[] = [];

  public radarChartData: ChartData<'radar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Estadísticas Base' }]
  };

  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      r: {
        angleLines: { color: 'rgba(0, 0, 0, 0.2)' },
        grid: { color: 'rgba(0, 0, 0, 0.2)' },
        pointLabels: { color: '#333', font: { size: 12 } },
        ticks: { display: false },
        suggestedMin: 0,
        suggestedMax: 120
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public radarChartType: ChartType = 'radar';

  ngOnInit(): void {
    if (this.stats) {
      const labels = this.stats.map(stat => this.formatStatName(stat.stat.name));
      const data = this.stats.map(stat => stat.base_stat);

      this.radarChartData = {
        labels: labels,
        datasets: [
          {
            data: data,
            label: 'Estadísticas Base',
            backgroundColor: 'rgba(251, 191, 36, 0.4)',
            borderColor: 'rgba(251, 191, 36, 1)',
            pointBackgroundColor: 'rgba(251, 191, 36, 1)',
          }
        ]
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Este bloque se ejecutará cada vez que 'stats' cambie
    if (changes['stats'] && this.stats) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    const labels = this.stats.map(stat => this.formatStatName(stat.stat.name));
    const data = this.stats.map(stat => stat.base_stat);

    this.radarChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Estadísticas Base',
          backgroundColor: 'rgba(251, 191, 36, 0.4)',
          borderColor: 'rgba(251, 191, 36, 1)',
          pointBackgroundColor: 'rgba(251, 191, 36, 1)',
        }
      ]
    };
  }

  private formatStatName(name: string): string {
    const nameMap: { [key: string]: string } = {
      'hp': 'HP',
      'attack': 'Atk',
      'defense': 'Def',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      'speed': 'Speed'
    };
    return nameMap[name] || name;
  }
}
