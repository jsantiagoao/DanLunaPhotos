import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  randomPhrase: string = '';
  randomClosing: string = '';

  private phrasesWithClosings: Array<{ phrase: string; closing: string }> = [
    {
      phrase: 'Nos encantará capturar la belleza de su amor, su fuerza y su ternura, en una sesión que se volverá inolvidable.',
      closing: 'Con cariño,'
    },
    {
      phrase: 'Cada momento merece ser eternizado. Permítenos contar tu historia a través de nuestro lente.',
      closing: 'Atentamente,'
    },
    {
      phrase: 'Tu historia es única y merece ser capturada con la pasión que solo nosotros podemos ofrecer.',
      closing: 'Con cariño,'
    },
    {
      phrase: 'Transformamos instantes en recuerdos que durarán para siempre. Déjanos ser parte de tu historia.',
      closing: 'Atentamente,'
    },
    {
      phrase: 'La fotografía es el arte de congelar emociones. Confía en nosotros para capturar las tuyas.',
      closing: 'Con cariño,'
    },
    {
      phrase: 'Cada sesión es una experiencia única. Queremos ser los elegidos para inmortalizar tus momentos especiales.',
      closing: 'Atentamente,'
    },
    {
      phrase: 'No solo tomamos fotos, creamos arte con tus emociones. Elige calidad, elige profesionalismo.',
      closing: 'Atentamente,'
    },
    {
      phrase: 'Tu felicidad es nuestra inspiración. Permítenos capturar la esencia de quien eres.',
      closing: 'Con cariño,'
    },
    {
      phrase: 'Detrás de cada gran fotografía hay una conexión especial. Construyámosla juntos.',
      closing: 'Con cariño,'
    },
    {
      phrase: 'Los mejores recuerdos merecen la mejor fotografía. Estamos listos para crear magia contigo.',
      closing: 'Atentamente,'
    },
    {
      phrase: 'Capturamos no solo imágenes, sino sentimientos que perdurarán por generaciones.',
      closing: 'Con cariño,'
    },
    {
      phrase: 'Tu confianza es nuestro mayor honor. Déjanos demostrar por qué somos tu mejor elección.',
      closing: 'Atentamente,'
    }
  ];

  ngOnInit(): void {
    this.selectRandomPhrase();
  }

  private selectRandomPhrase(): void {
    const randomIndex = Math.floor(Math.random() * this.phrasesWithClosings.length);
    const selected = this.phrasesWithClosings[randomIndex];
    this.randomPhrase = selected.phrase;
    this.randomClosing = selected.closing;
  }
}
