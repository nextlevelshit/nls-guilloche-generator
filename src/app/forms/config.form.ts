import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const fb = new FormBuilder();

export let ConfigForm: FormGroup = fb.group({
  width: fb.control('', Validators.required),
  height: fb.control('', Validators.required),
  directionStart: fb.control('', Validators.compose([
    Validators.min(0),
    Validators.max(360)
  ])),
  directionEnd: fb.control('', Validators.compose([
    Validators.min(0),
    Validators.max(360)
  ])),
  nodes: fb.control('', Validators.compose([
    Validators.min(1),
    Validators.max(10)
  ])),
  scale: fb.control('', Validators.compose([
    Validators.min(0),
    Validators.max(1)
  ])),
});
