export default class characterClass {
  constructor(x, y, dx, dy, character, fontSize, color, number, pathType = 'linear') {
    this.character = character; // Character to display
    this.fontSize = fontSize; // Size of the character
    this.color = color; // Color of the character
    this.number = number; // Number of soldiers
    this.pathType = pathType; // 'linear', 'sin', 'cos'
    this.angle = 0; // Used for sine and cosine

    // Create an array to store positions and velocities for each summoned character
    this.soldiers = Array.from({ length: this.number }, () =>
      new this.Soldier(x, y, dx, dy, character, fontSize, color, pathType)
    );
  }

  // Nested Soldier class
  Soldier = class {
    constructor(x, y, dx, dy, character, fontSize, color, pathType = 'linear') {
      (character === 'D') ? this.x = x : this.x = x + (Math.random() - 0.5) * (fontSize * 6); // Random initial position around the main character
      (character === 'D') ? this.y = y : this.y = y + (Math.random() - 0.5) * (fontSize * 6); // Scale this
      this.dx = dx;
      this.dy = dy;
      this.character = character;
      this.fontSize = fontSize;
      this.color = color;
      this.pathType = pathType;
      this.angle = 0;
    }

    draw(ctx) {
      ctx.font = `${this.fontSize}px Arial`;
      ctx.fillStyle = this.color;
      ctx.fillText(this.character, this.x, this.y);
    }

    update(canvas) {
      switch (this.pathType) {
        case 'sin':
          this.x += this.dx;
          this.y = canvas.height / 2 + Math.sin(this.angle) * 100; // Amplitude of 100
          this.angle += 0.010; // Controls the speed of the sine wave
          break;
        case 'cos':
          this.x += this.dx;
          this.y = canvas.height / 2 + Math.cos(this.angle) * 100; // Amplitude of 100
          this.angle += 0.025; // Controls the speed of the cosine wave
          break;
        case 'circular':
          this.x = canvas.width / 2 + Math.cos(this.angle) * 100; // Circular path with radius 100
          this.y = canvas.height / 2 + Math.sin(this.angle) * 100;
          this.angle += 0.03;
          break;
        default:
          this.x += this.dx;
          this.y += this.dy;
          break;
      }
      // Bounce off the walls
      if (this.x + this.fontSize > canvas.width || this.x < 0) {
        this.dx = -this.dx;
      }
      if (this.y + this.fontSize > canvas.height || this.y - this.fontSize < 0) {
        this.dy = -this.dy;
      }
    }
  };

  // Get all soldier's positions
  get() {
    let all_x = this.soldiers.map(soldier => soldier.x);
    let all_y = this.soldiers.map(soldier => soldier.y);
    return [all_x, all_y];
  }

  // Draw each soldier on the canvas
  draw(ctx) {
    this.soldiers.forEach(soldier => soldier.draw(ctx));
  }

  // Hierarchy of power
  hierarchy(race) {
    if (this.character === 'N' && race === 'aeldari') return true;
    if (this.character === 'A' && race === 'tyranid') return true;
    if (this.character === 'T' && race === 'spaceMarine') return true;
    if (this.character === 'S' && race === 'necron') return true;
    return false;
  }

  // Update each soldier's position and handle boundaries
  update(ctx, canvas, other_pos, death_mode) {
    this.soldiers.forEach(soldier => soldier.update(canvas));

    // Bounce off other soldiers
    for (let i = 0; i < this.soldiers.length; i++) {
      for (let j = 0; j < this.soldiers.length; j++) {
        if (i !== j) {
          let soldier1 = this.soldiers[i];
          let soldier2 = this.soldiers[j];
          let distance = Math.sqrt(
            Math.pow(soldier1.x - soldier2.x, 2) + Math.pow(soldier1.y - soldier2.y, 2)
          );
          if (distance < this.fontSize) {
            soldier1.dy = -soldier1.dy;
            soldier2.dx = -soldier2.dx;
            soldier2.dy = -soldier2.dy;
          }
        }
      }
    }

    // Bounce off enemy soldiers
    for (let race in other_pos) {
      if (!other_pos[race]) continue;
      const race_x = other_pos[race][0];
      const race_y = other_pos[race][1];
      let i = 0;
      while (i < this.soldiers.length) {
        let current_soldier = this.soldiers[i];
        for (let k = 0; k < race_x.length; k++) {
          let distance = Math.sqrt(
            Math.pow(current_soldier.x - race_x[k], 2) + Math.pow(current_soldier.y - race_y[k], 2)
          );
          if (distance < this.fontSize) {
            if (this.hierarchy(race)) {
              if (!death_mode) {
                // Clear the area where the character was drawn
                ctx.clearRect(current_soldier.x - this.fontSize / 2,
                  current_soldier.y - this.fontSize,
                  this.fontSize, this.fontSize);
                this.soldiers.splice(i, 1); // Remove the current soldier from the soldiers' array
              } else {
              this.soldiers.splice(i, 1, new this.Soldier(current_soldier.x, current_soldier.y, 0, 0, 'D', 30, 'green')) // Or replace with dead
              }
            } else {
              current_soldier.dx = -current_soldier.dx;
              // current_soldier.dy = -current_soldier.dy;
            }
          }
        }
        i += 1;
      }
    }
  }
}
