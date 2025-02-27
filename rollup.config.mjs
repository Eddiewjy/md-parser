import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/esm/index.js',
        format: 'esm',
        sourcemap: false
      },
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: false
      }
    ],
    plugins: [
      typescript({
        clean: true, // 清理之前的编译结果
      }),
      resolve(),
      commonjs()
    ]
  }
];
