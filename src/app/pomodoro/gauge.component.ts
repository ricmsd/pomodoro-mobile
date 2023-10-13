import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from "@angular/core";
import * as echarts from 'echarts';

const GaugeColor = {
  TomatoRed: '#ea5548',
  Green: '#22c55e',
  Axis: '#555',
} as const;

export const Second = {
  Zero: <number>0,
  Minutes25: <number>(60 * 25),
  Minutes30: <number>(60 * 30),
} as const;
  
@Component({
  selector: 'app-gauge-component',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss']
})
export class GaugeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('echarts') echartsElementRef?: ElementRef<HTMLElement>;

  private _second: number = Second.Zero;
  @Input() set second(value: number) {
    this._second = Math.min(value, Second.Minutes30);
    this.updateChart();
  }
  get second(): number {
    return this._second;
  }

  @Input() paused: boolean = false;

  public chart?: echarts.ECharts;
  public color: string = GaugeColor.TomatoRed;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private createChart(): void {
    this.chart = echarts.init(this.echartsElementRef?.nativeElement, null, {
      renderer: 'svg',
      width: 384,
      height: 384,
    });
    this.chart.setOption({
      series: [
        {
          name: 'minute',
          type: 'gauge',
          zlevel: 0,
          min: 0,
          max: 30,
          splitNumber: 6,
          silent: true,
          pointer: {
            show: false
          },
          progress: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 50
            },
            roundCap: true
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 50,
            itemStyle: {
              color: this.color
            }
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['6%', '70%'],
            formatter: function(value: number) {
              return `{value|${value}}{unit|min}`;
            },
            rich: {
              value: {
                fontSize: 32,
                color: 'var(--data-color)'
              },
              unit: {
                fontSize: 14,
                color: 'var(--data-color)',
                padding: [0, 0, -8, 4]
              }
            }
          },
          data: [
            {
              value: 0
            }
          ]
        },
        {
          name: 'second',
          type: 'gauge',
          zlevel: 1,
          min: Second.Zero,
          max: Second.Minutes30,
          splitNumber: 6,
          silent: true,
          itemStyle: {
            color: this.color
          },
          pointer: {
            show: true,
            width: 12
          },
          progress: {
            show: true,
            width: 50,
            roundCap: true
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          splitLine: {
            show: false,
          },
          title: {
            show: false
          },
          detail: {
            show: false,
          },
          data: [
            {
              value: Second.Zero
            }
          ]
        },
        {
          name: 'tick-on-progress',
          type: 'gauge',
          zlevel: 2,
          min: 0,
          max: 30,
          splitNumber: 6,
          silent: true,
          itemStyle: {
            color: this.color
          },
          pointer: {
            show: false
          },
          progress: {
            show: false,
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: true,
            distance: -8,
            lineStyle: {
              color: GaugeColor.Axis,
              width: 1,
              cap: 'round'
            }
          },
          axisLabel: {
            show: true,
            color: GaugeColor.Axis,
            fontSize: 14
          },
          splitLine: {
            show: true,
            length: 15,
            distance: -8,
            lineStyle: {
              color: GaugeColor.Axis,
              width: 2,
              cap: 'round'
            }
          },
          title: {
            show: false
          },
          detail: {
            show: false,
          },
          data: [
            {
              value: 0
            }
          ]
        }
      ]
    });

    // resize automatically.
    const svgWrapperDiv = <HTMLDivElement>this.chart?.getDom().querySelector('div');
    svgWrapperDiv.style.width = '100%';
    svgWrapperDiv.style.height = '100%';
    const svg = <SVGElement>this.chart?.getDom().querySelector('svg');
    svg.setAttribute('viewBox', '0 0 384 384');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
  }

  private destroyChart(): void {
    if (!this.chart) {
      return;
    }
    echarts.dispose(this.chart);
  }

  private updateChart(): void {
    if (this.second >= Second.Minutes25) {
      this.color = GaugeColor.Green;
    } else {
      this.color = GaugeColor.TomatoRed;
    }
    this.chart?.setOption({
      series: [
        {
          name: 'minute',
          anchor: {
            itemStyle: {
              color: this.color
            },
          },
          data: [{
            value: Math.floor(this.second / 60)
          }]
        },
        {
          name: 'second',
          itemStyle: {
            color: this.color
          },
          data: [{
            value: this.second
          }]
        }
      ]
    });
  }

  @HostListener('window:resize', ['$event'])
  public onResizeWindow(event: Event): void {
    // resize() is not called. Instead, CSS and SVG are used to scale the image to fit the Windows size.
    // this.chart?.resize();
  }

}
