# sitetool

_TODO: english translation_

## sitetool.config.js

```javascript
module.exports = {
  // ディレクトリ設定
  directory: {
    src: 'src', // ソースファイルディレクトリの相対パス
    work: 'work', // 作業中の生成ファイルを格納＋ローカルサーバで扱うディレクトリの相対パス
    dist: 'dist' // 最終出力ディレクトリの相対パス
  },
  // ルール
  // 上から順にファイル名を正規表現で判定
  // パターンにマッチしたらそのルールを使用
  // 無視パターンにマッチしたら何もしない
  // どちらにもマッチしなければ次のルール
  rule: [
    {
      name: 'my rule', // ルール名
      pattern: [/\.html$/], // マッチするパターン
      ignore: [/^_/], // 無視するパターン
      extname: '.html', // 出力時の拡張子（変更なければ省略可）
      func: {
        // 使用する変換関数
        work: ['file-preprocess'], // 作業中の変換関数
        dist: ['file-preprocess', 'html-format'] // 最終出力の変換関数
      }
    },
    {
      pattern: /\.foo$/, // パターンが一つしかなければ配列でなくてもよい
      func: ['file-gzip'] // 作業中と最終出力で変わりなければこれでも可
    },
    {
      pattern: /\.bar$/, // パターンが一つしかなければ配列でなくてもよい
      func: 'file-gzip' // 文字列のみでも可
    }
  ],
  // オプション
  {
    'css-postcss': {
      autoprefixer: {}, // autoprefixerのオプション（browsesなどを想定）
      development: { // 作業中のみ使用するオプション
        autoprefixer: {},
      },
      production: { // 最終出力のみ使用するオプション
        autoprefixer: {},
      }
    },
    'file-preprocess': {
      foo: 'FOO', // {{NAME}} で表示する値
    },
    server: {
      port: 3000, // ローカルサーバのTCPポート番号
      // その他 BrowserSyncのオプションを使用可能
    }
  }
};
```

### default config

```javascript
module.exports = {
  directory: {
    src: '<ROOT>/src',
    work: '<ROOT>/work',
    dist: '<ROOT>/dist'
  },
  rule: [],
  option: {
    'css-postcss': {
      autoprefixer: {
        browsers: ['> 5%', 'not dead']
      }
    },
    server: {
      port: 3000
    }
  }
};
```

## 変換関数

### css-postcss

以下を決め打ちで実行

- css-mqpacker
- postcss-sorting
- autoprefixer
- beautify オプション有効時のみ: prettier
- minify オプション有効時のみ: cssnano

beautify と minifiy が同時指定された場合は beautify を有線

### file-gzip

ファイルを GZip 圧縮

### file-preprocess

プリプロセス処理を実行

| 構文                  | 役割                      |
| --------------------- | ------------------------- |
| {{NAME}}              | 変数 NAME 内容を展開      |
| {{:: "NAME" "VALUE"}} | 変数 NAME に VALUE を設定 |
| {{-- "PATH"}}         | PATH のファイルを挿入     |

以下の変数が定義済み

- \_\_relativeRoot\_\_: 当該ファイルからルートディレクトリまでの相対パス
- \_\_srcDir\_\_: ソースディレクトリの絶対パス

### html-format

prettier による整形

### image-minify

画像の最適化

### js-format

- beautify オプション有効時のみ: prettier による最適化 と 行コメント削除
- minify オプション有効時のみ: uglify-js による minify

### sass-compile

node-sass によるコンパイル
