import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const fb = new FormBuilder();

export let ConfigForm: FormGroup = fb.group({
  width: fb.control('', Validators.required),
  height: fb.control('', Validators.required),
  vectors: fb.group({
    start: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(2)
    ])),
    end: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(2)
    ])),
    range: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(1)
    ]))
  }),
  nodes: fb.control('', Validators.compose([
    Validators.min(1),
    Validators.max(10)
  ])),
  scale: fb.control('', Validators.compose([
    Validators.min(0),
    Validators.max(1)
  ])),
  stroke: fb.control('', Validators.compose([
    Validators.min(0.1),
    Validators.max(10)
  ])),
  overlap: fb.control('', Validators.min(0.1)),
  spread: fb.control('', Validators.min(0)),
});
