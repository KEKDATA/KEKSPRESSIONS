import { loadModelFx, loadModelsListFx } from './effects';
import { $model, $modelsList } from './store';

$modelsList.on(loadModelsListFx.doneData, (_, s) => s);
$model.on(loadModelFx.doneData, (_, p) => p);
