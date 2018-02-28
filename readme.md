## autosave

### installation

`npm install --save @yoerivd/autosave-form`

### how to use

```
<form data-auto-save>
    <input type="text" data-auto-save-trigger="text"/>
    <input type="button" data-auto-save-trigger="button"/>
    <!-- https://bootstrap-datepicker.readthedocs.io/en/latest/ >
    <input type="text" class="datapicker" data-auto-save-trigger="button"/>
    <select data-auto-save-trigger="lookup">
        <option>1</option>
        <option>3</option>
    </select>
</form>
```


```
import {activateAutoSave} from '@yoerivd/autosave-form';

activateAutoSave(); 
```