import { Component, OnInit, } from '@angular/core';
import { NgForOf, NgStyle } from '@angular/common';
@Component({
  selector: 'app-landing-three-bg',
  standalone: true,
  imports: [NgForOf, NgStyle],
  templateUrl: './landing-three-bg.component.html',
  styleUrl: './landing-three-bg.component.scss'
})

export class LandingThreeBgComponent implements OnInit {
  hexagons: Array<{ style: { [key: string]: string } }> = [];

  ngOnInit() {
    this.createHexagons(20); // Create 20 hexagons
  }

  createHexagons(count: number) {
    for (let i = 0; i < count; i++) {
      const size = this.random(25, 100); // Random size between 50 and 150px
      const positionX = this.random(0, 100); // Random position between 0% and 100%
      const positionY = this.random(0, 100); // Random position between 0% and 100%
      const animationDuration = this.random(5, 15); // Random duration between 5s and 15s

      this.hexagons.push({
        style: {
          width: `${size}px`,
          height: `${size * 1.15}px`, // Adjust height for hexagon shape
          top: `${positionY}%`,
          left: `${positionX}%`,
          animationDuration: `${animationDuration}s`,
        }
      });
    }
  }

  random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}