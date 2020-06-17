import * as tf from '@tensorflow/tfjs';
import * as R from 'ramda';

const xsLens = R.lensProp('xs');
const ysLens = R.lensProp('ys');

const USAGES = ['Training', 'PublicTest', 'PrivateTest'] as const;
type Usages = typeof USAGES[number];

// 28709
export async function loadData(path: string, usage: Usages = 'Training') {
  return (
    (tf.data
      .csv(path, {
        columnConfigs: {
          emotion: {
            isLabel: true,
          },
        },
      })
      .filter(x => {
        // @ts-ignore
        const { xs } = x;
        return xs.Usage === usage;
      })
      // extract values
      .map(x => {
        const { xs, ys } = (x as unknown) as {
          xs: tf.TensorContainerObject;
          ys: tf.TensorContainerObject;
        };
        const transform = R.compose<object, object, any[], any>(
          R.head,
          R.values,
          R.omit(['Usage']),
        );

        return { xs: transform(xs) as string, ys: transform(ys) as number };
      })
      // split pixels
      .map(R.over(xsLens, R.split(' ')))
      // normalize pixels
      .map(R.over(xsLens, R.map(R.divide(R.__, 255))))
      // label => tensor ([1, 0, 0, 0, 0, 0, 0])
      .map(R.over(ysLens, y => tf.oneHot(y, 7)))
      // increase channel from 1 to 3
      .map(
        R.over(xsLens, x => {
          return tf.tidy(() => {
            const t = tf.tensor3d(x, [48, 48, 1]);
            const stacked = tf.stack([t, t, t], 2).reshape([48, 48, 3]) as tf.Tensor3D;
            return tf.image.resizeBilinear(stacked, [224, 224]);
          });
        }),
      ) as unknown) as tf.data.Dataset<{ xs: tf.Tensor3D; ys: tf.Tensor1D }>
  );
}
