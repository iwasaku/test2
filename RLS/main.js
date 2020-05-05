//console.log = function () { };  // ログを出す時にはコメントアウトする

const SCREEN_WIDTH = 1280 - 64;              // スクリーン幅
const SCREEN_HEIGHT = 2436;              // スクリーン高さ
const SCREEN_CENTER_X = SCREEN_WIDTH / 2;   // スクリーン幅の半分
const SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;  // スクリーン高さの半分

const FPS = 30; // 30フレ

const FONT_FAMILY = "'misaki_gothic','Meiryo',sans-serif";
const ASSETS = {
    "player": "./resource/angus_128.png",
    "enemy0": "./resource/assassin_128.png",

    "arrow_u": "./resource/arrow_u_128.png",
    "arrow_d": "./resource/arrow_d_128.png",
    "arrow_l": "./resource/arrow_l_128.png",
    "arrow_r": "./resource/arrow_r_128.png",
    "arrow_l_d": "./resource/arrow_l_d_128.png",
    "arrow_l_r": "./resource/arrow_l_u_128.png",
    "arrow_r_d": "./resource/arrow_r_d_128.png",
    "arrow_r_u": "./resource/arrow_r_u_128.png",

    "button_a": "./resource/button_a_128.png",
    "button_b": "./resource/button_b_128.png",

    "bg": "./resource/bg.png?2",  // 背景
    "fade": "./resource/dark_128.png",  // フェード・イン／フェード・アウト用
};

// 定義
const PL_STATUS = defineEnum({
    INIT: {
        value: 0,
        isStarted: Boolean(0),  // スタートしてない
        isDead: Boolean(0),     // 死んでない
        isAccKey: Boolean(0),     // キー入力を受付無い
        string: 'init'
    },
    START: {
        value: 1,
        isStarted: Boolean(1),  // スタート済み
        isDead: Boolean(0),     // 死んでない
        isAccKey: Boolean(1),     // キー入力を受付無い
        string: 'start'
    },
    FADE_IN: {
        value: 2,
        isStarted: Boolean(1),  // スタート済み
        isDead: Boolean(0),     // 死んでない
        isAccKey: Boolean(0),     // キー入力を受付無い
        string: 'fade_in'
    },
    FADE_OUT: {
        value: 3,
        isStarted: Boolean(1),  // スタート済み
        isDead: Boolean(0),     // 死んでない
        isAccKey: Boolean(0),     // キー入力を受付無い
        string: 'fade_out'
    },
    DEAD: {
        value: 4,
        isStarted: Boolean(0),  // スタートしてない
        isDead: Boolean(1),     // 死んだ
        isAccKey: Boolean(0),     // キー入力を受付無い
        string: 'dead'
    },
});

const MAP_CHIP_DEF = defineEnum({
    DARK: {
        value: 0,
        collision: true,
        brightness: false,
        isRoom: false,
        isFloor: false,
        isPath: false,
        string: 'dark'
    },
    DOOR: {
        value: 1,
        collision: false,
        brightness: true,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 'door'
    },
    FLOOR: {
        value: 2,
        collision: false,
        brightness: true,
        isRoom: true,
        isFloor: true,
        isPath: false,
        string: 'floor'
    },
    PATH: {
        value: 3,
        collision: false,
        brightness: false,
        isRoom: false,
        isFloor: false,
        isPath: true,
        string: 'path'
    },
    DOWN: {
        value: 4,
        collision: false,
        brightness: true,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 'DOWN'
    },
    UP: {
        value: 5,
        collision: false,
        brightness: true,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 'up'
    },
    T_BOX: {
        value: 6,
        collision: false,
        brightness: true,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 't_box'
    },
    WALL_0: {
        value: 7,
        collision: true,
        brightness: false,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 'wall_0'
    },
    WALL_1: {
        value: 8,
        collision: true,
        brightness: false,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 'wall_1'
    },
    S_DOOR_0: {
        value: 9,
        collision: true,
        brightness: false,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 's_door_0'
    },
    S_DOOR_1: {
        value: 10,
        collision: true,
        brightness: false,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 's_door_1'
    },
    TRAP_F: {
        value: 11,
        collision: false,
        brightness: true,
        isRoom: true,
        isFloor: true,
        isPath: false,
        string: 'trap_f'
    },
    TRAP_P: {
        value: 12,
        collision: false,
        brightness: true,
        isRoom: false,
        isFloor: false,
        isPath: true,
        string: 'trap_p'
    },
    TRAP_T: {
        value: 13,
        collision: false,
        brightness: true,
        isRoom: true,
        isFloor: false,
        isPath: false,
        string: 'trap_t'
    },

    // 配置時に使用。実際のmapArrayには使用されない
    MONSTER_F: {
        value: -1,
        collision: null,
        brightness: null,
        isRoom: null,
        isFloor: null,
        isPath: null,
        string: 'monster_f'
    },
    MONSTER_P: {
        value: -2,
        collision: null,
        brightness: null,
        isRoom: null,
        isFloor: null,
        isPath: null,
        string: 'monster_p'
    },
    DIV_LINE: {
        value: -3,
        collision: null,
        brightness: null,
        isRoom: null,
        isFloor: null,
        isPath: null,
        string: 'div_line'
    },
});

// マップ
// FIXME:実際は(100+4+4)*(100+4+4)で自動生成する
// ※表示の都合に合わせて周囲に４キャラ分の闇を用意しておく
// ※有効な領域が100*100の場合、その周囲に４キャラのガード領域を用意するので配列的には108*108必要で、有効なマップ座標はx=４〜103,y=４〜103
// new Array(SCRN_WIDTH * SCRN_HEIGHT);
// 0:闇 1:扉 2:床 3:道 4:下り 5:上り 6:宝箱 7:壁０ 8:壁１ 9:隠し扉(壁０) 10:隠し扉(壁１) 11:罠(床) 12:罠(道) 13:罠(宝箱)
/*
const MAP_WIDTH = 20 + 4 + 4;// マップ幅（キャラ数）＋プレイヤーの行動範囲±￥4
const MAP_HEIGHT = 20 + 4 + 4;// マップ高さ（キャラ数）＋プレイヤーの行動範囲±￥4
let mapArray = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 0, 7, 8, 8, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 0, 7, 2, 2, 2, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 0, 7, 2, 2, 2, 7, 0, 0, 7, 8, 8, 8, 7, 0, 0, 0, 7, 8, 8, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 7, 2, 4, 2, 1, 3, 3, 1, 2, 2, 2, 7, 0, 0, 0, 7, 2, 2, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 7, 2, 2, 2, 7, 0, 0, 7, 2, 2, 2, 1, 3, 3, 0, 7, 2, 2, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 8, 1, 8, 8, 8, 0, 0, 7, 2, 2, 2, 7, 0, 3, 0, 7, 2, 2, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 7, 2, 2, 2, 7, 0, 3, 3, 9, 2, 2, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 8, 8, 1, 8, 8, 0, 0, 0, 7, 2, 2, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 7, 2, 2, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 12, 3, 3, 3, 0, 8, 8, 8, 8, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 8, 1, 8, 7, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 2, 2, 2, 7, 0, 0, 7, 8, 8, 8, 8, 10, 8, 8, 7, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 2, 2, 2, 7, 0, 0, 7, 2, 2, 2, 2, 2, 2, 2, 7, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 2, 11, 2, 7, 0, 0, 7, 2, 2, 2, 2, 2, 2, 2, 7, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 2, 2, 2, 7, 0, 0, 7, 2, 6, 2, 13, 2, 2, 2, 7, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 2, 2, 2, 7, 0, 0, 7, 2, 2, 2, 2, 2, 5, 2, 7, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 0, 0, 7, 2, 2, 2, 2, 2, 2, 2, 7, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
 */
const MAP_WIDTH = 100 + 4 + 4;// マップ幅（キャラ数）＋プレイヤーの行動範囲±￥4
const MAP_HEIGHT = 100 + 4 + 4;// マップ高さ（キャラ数）＋プレイヤーの行動範囲±￥4
let mapArray = [];
function setMapArray(x, y, val) {
    mapArray[y][x] = val;
}
function getMapArray(x, y) {
    return mapArray[y][x];
}
function initMapArray() {
    mapArray = new Array(MAP_HEIGHT);
    for (let yy = 0; yy < MAP_HEIGHT; yy++) {
        mapArray[yy] = new Array(MAP_WIDTH).fill(0);
    }
}
function printMapArray() {
    for (let yy = 0; yy < MAP_HEIGHT; yy++) {
        let tmp = "";
        for (let xx = 0; xx < MAP_WIDTH; xx++) {
            tmp += mapArray[yy][xx].toString(16);
        }
        console.log(tmp);
    }
}

// デバッグ表示用
// 0:非表示 1:表示
let debugArray = [];
function setDebugArray(x, y, val) {
    debugArray[y][x] = val;
}
function getDebugArray(x, y) {
    return debugArray[y][x];
}
function initDebugArray(val) {
    debugArray = new Array(MAP_HEIGHT);
    for (let yy = 0; yy < MAP_HEIGHT; yy++) {
        debugArray[yy] = new Array(MAP_WIDTH).fill(val);
    }
}
function printDebugArray() {
    for (let yy = 0; yy < MAP_HEIGHT; yy++) {
        let tmp = "";
        for (let xx = 0; xx < MAP_WIDTH; xx++) {
            tmp += debugArray[yy][xx];
        }
        console.log(tmp);
    }
}

// 表示／非表示 
// FIXME:mapと同じサイズにする
// 0:非表示 1:表示
let viewArray = [];
function setViewArray(x, y, val) {
    viewArray[y][x] = val;
}
function getViewArray(x, y) {
    return viewArray[y][x];
}
function initViewArray() {
    viewArray = new Array(MAP_HEIGHT);
    for (let yy = 0; yy < MAP_HEIGHT; yy++) {
        viewArray[yy] = new Array(MAP_WIDTH).fill(0);
    }
}

// マップ表示に使用する
// 9*9のスプライトが入る
const BG_WIDTH = 9;// BG幅（キャラ数）
const BG_HEIGHT = 9;// BG高さ（キャラ数）
let bgArray = [
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
];
function setBgArray(x, y, val) {
    bgArray[y][x] = val;
}
function getBgArray(x, y) {
    return bgArray[y][x];
}
// 成長タイプテーブル
// プレイヤー用テーブル
const myGrowthTypeTable = [
    { atk: 1.00, agi: 0.90, hp: 0.80, bonus: 2.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.90, agi: 1.00, hp: 0.80, bonus: 2.0, attr: ITEM_ATTR.WATER },
    { atk: 0.90, agi: 0.80, hp: 1.00, bonus: 2.0, attr: ITEM_ATTR.FIRE },
    { atk: 1.00, agi: 0.80, hp: 0.90, bonus: 2.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.80, agi: 1.00, hp: 0.90, bonus: 2.0, attr: ITEM_ATTR.WATER },
    { atk: 0.80, agi: 0.90, hp: 1.00, bonus: 2.0, attr: ITEM_ATTR.FIRE },

    { atk: 1.00, agi: 0.90, hp: 0.80, bonus: 2.5, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.90, agi: 1.00, hp: 0.80, bonus: 2.5, attr: ITEM_ATTR.WATER },
    { atk: 0.90, agi: 0.80, hp: 1.00, bonus: 2.5, attr: ITEM_ATTR.FIRE },
    { atk: 1.00, agi: 0.80, hp: 0.90, bonus: 2.5, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.80, agi: 1.00, hp: 0.90, bonus: 2.5, attr: ITEM_ATTR.WATER },
    { atk: 0.80, agi: 0.90, hp: 1.00, bonus: 2.5, attr: ITEM_ATTR.FIRE },

    { atk: 1.00, agi: 0.90, hp: 0.80, bonus: 3.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.90, agi: 1.00, hp: 0.80, bonus: 3.0, attr: ITEM_ATTR.WATER },
    { atk: 0.90, agi: 0.80, hp: 1.00, bonus: 3.0, attr: ITEM_ATTR.FIRE },
    { atk: 1.00, agi: 0.80, hp: 0.90, bonus: 3.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.80, agi: 1.00, hp: 0.90, bonus: 3.0, attr: ITEM_ATTR.WATER },
    { atk: 0.80, agi: 0.90, hp: 1.00, bonus: 3.0, attr: ITEM_ATTR.FIRE },

    { atk: 1.00, agi: 0.90, hp: 0.80, bonus: 3.5, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.90, agi: 1.00, hp: 0.80, bonus: 3.5, attr: ITEM_ATTR.WATER },
    { atk: 0.90, agi: 0.80, hp: 1.00, bonus: 3.5, attr: ITEM_ATTR.FIRE },
    { atk: 1.00, agi: 0.80, hp: 0.90, bonus: 3.5, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.80, agi: 1.00, hp: 0.90, bonus: 3.5, attr: ITEM_ATTR.WATER },
    { atk: 0.80, agi: 0.90, hp: 1.00, bonus: 3.5, attr: ITEM_ATTR.FIRE },

    { atk: 1.00, agi: 1.00, hp: 1.00, bonus: 4.0, attr: ITEM_ATTR.ALL_P },
];

// 敵用テーブル
const eneGrowthTypeTable = [
    { atk: 1.0, agi: 0.9, hp: 0.8, bonus: 0.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.9, agi: 1.0, hp: 0.8, bonus: 0.0, attr: ITEM_ATTR.WATER },
    { atk: 0.9, agi: 0.8, hp: 1.0, bonus: 0.0, attr: ITEM_ATTR.FIRE },
    { atk: 1.0, agi: 0.8, hp: 0.9, bonus: 0.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.8, agi: 1.0, hp: 0.9, bonus: 0.0, attr: ITEM_ATTR.WATER },
    { atk: 0.8, agi: 0.9, hp: 1.0, bonus: 0.0, attr: ITEM_ATTR.FIRE },

    { atk: 1.0, agi: 0.9, hp: 0.8, bonus: 1.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.9, agi: 1.0, hp: 0.8, bonus: 1.0, attr: ITEM_ATTR.WATER },
    { atk: 0.9, agi: 0.8, hp: 1.0, bonus: 1.0, attr: ITEM_ATTR.FIRE },
    { atk: 1.0, agi: 0.8, hp: 0.9, bonus: 1.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.8, agi: 1.0, hp: 0.9, bonus: 1.0, attr: ITEM_ATTR.WATER },
    { atk: 0.8, agi: 0.9, hp: 1.0, bonus: 1.0, attr: ITEM_ATTR.FIRE },

    { atk: 1.0, agi: 0.9, hp: 0.8, bonus: 2.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.9, agi: 1.0, hp: 0.8, bonus: 2.0, attr: ITEM_ATTR.WATER },
    { atk: 0.9, agi: 0.8, hp: 1.0, bonus: 2.0, attr: ITEM_ATTR.FIRE },
    { atk: 1.0, agi: 0.8, hp: 0.9, bonus: 2.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.8, agi: 1.0, hp: 0.9, bonus: 2.0, attr: ITEM_ATTR.WATER },
    { atk: 0.8, agi: 0.9, hp: 1.0, bonus: 2.0, attr: ITEM_ATTR.FIRE },

    { atk: 1.0, agi: 0.9, hp: 0.8, bonus: 3.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.9, agi: 1.0, hp: 0.8, bonus: 3.0, attr: ITEM_ATTR.WATER },
    { atk: 0.9, agi: 0.8, hp: 1.0, bonus: 3.0, attr: ITEM_ATTR.FIRE },
    { atk: 1.0, agi: 0.8, hp: 0.9, bonus: 3.0, attr: ITEM_ATTR.NEUTRAL },
    { atk: 0.8, agi: 1.0, hp: 0.9, bonus: 3.0, attr: ITEM_ATTR.WATER },
    { atk: 0.8, agi: 0.9, hp: 1.0, bonus: 3.0, attr: ITEM_ATTR.FIRE },

    { atk: 1.0, agi: 1.0, hp: 1.0, bonus: 4.0, attr: ITEM_ATTR.ALL_P },
];

// 経験値テーブル
const expTable = [
    { lv: 0, atk: 2, agi: 2, hp: 7, exp: -32767 },
    { lv: 1, atk: 4, agi: 4, hp: 15, exp: 0 },
    { lv: 2, atk: 5, agi: 4, hp: 22, exp: 7 },
    { lv: 3, atk: 7, agi: 6, hp: 24, exp: 23 },
    { lv: 4, atk: 7, agi: 8, hp: 31, exp: 47 },
    { lv: 5, atk: 12, agi: 10, hp: 35, exp: 110 },

    { lv: 6, atk: 16, agi: 10, hp: 38, exp: 220 },
    { lv: 7, atk: 18, agi: 17, hp: 40, exp: 450 },
    { lv: 8, atk: 22, agi: 20, hp: 46, exp: 800 },
    { lv: 9, atk: 30, agi: 22, hp: 50, exp: 1300 },
    { lv: 10, atk: 35, agi: 31, hp: 54, exp: 2000 },

    { lv: 11, atk: 40, agi: 35, hp: 62, exp: 2900 },
    { lv: 12, atk: 48, agi: 40, hp: 63, exp: 4000 },
    { lv: 13, atk: 52, agi: 48, hp: 70, exp: 5500 },
    { lv: 14, atk: 60, agi: 55, hp: 78, exp: 7500 },
    { lv: 15, atk: 68, agi: 64, hp: 86, exp: 10000 },

    { lv: 16, atk: 72, agi: 70, hp: 92, exp: 13000 },
    { lv: 17, atk: 72, agi: 78, hp: 110, exp: 17000 },
    { lv: 18, atk: 85, agi: 84, hp: 115, exp: 21000 },
    { lv: 19, atk: 87, agi: 86, hp: 130, exp: 25000 },
    { lv: 20, atk: 92, agi: 88, hp: 138, exp: 29000 },

    { lv: 21, atk: 95, agi: 90, hp: 149, exp: 33000 },
    { lv: 22, atk: 97, agi: 90, hp: 158, exp: 37000 },
    { lv: 23, atk: 99, agi: 94, hp: 165, exp: 41000 },
    { lv: 24, atk: 103, agi: 98, hp: 170, exp: 45000 },
    { lv: 25, atk: 113, agi: 100, hp: 174, exp: 49000 },

    { lv: 26, atk: 117, agi: 105, hp: 180, exp: 53000 },
    { lv: 27, atk: 125, agi: 107, hp: 189, exp: 57000 },
    { lv: 28, atk: 130, agi: 115, hp: 195, exp: 61000 },
    { lv: 29, atk: 135, agi: 120, hp: 200, exp: 65000 },
    { lv: 30, atk: 140, agi: 130, hp: 210, exp: 65535 },

    { lv: -1, atk: -1, agi: -1, hp: -1, exp: 2147483647 },
];

// 敵出現テーブル
// ratioは足して100になるようにする
const enemyAppearTable = [
    [{ ene: ENEMY_DEF.ENEMY_0_BS, ratio: 100 },],
    [{ ene: ENEMY_DEF.ENEMY_0, ratio: 50 }, { ene: ENEMY_DEF.ENEMY_1, ratio: 50 },],
    [{ ene: ENEMY_DEF.ENEMY_0, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_1, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_2, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_0, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_1, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_2, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_1, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_2, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_3, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_2_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_1, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_2, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_3, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_2_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_2, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_3, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_2_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_2, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_3, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_2_P, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_3_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_2, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_3, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_2_P, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_3_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_4_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_3, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_4, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_5, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_4, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_5, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_6, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_4, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_5, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_6, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_5_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_4, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_5, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_6, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_5_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_4, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_5, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_6, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_5_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_5, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_6, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_5_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_5, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_6, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_5_P, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_6_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_5, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_6, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_5_P, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_6_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_5, ratio: 20 }, { ene: ENEMY_DEF.ENEMY_6, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_5_P, ratio: 40 }, { ene: ENEMY_DEF.ENEMY_6_P, ratio: 10 },],
    [{ ene: ENEMY_DEF.ENEMY_8_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_6, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_6_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_6, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_6_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_6, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_6_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_6, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_6_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_7, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_9_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_8, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_8, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_8, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_8, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_8_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_9, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_11_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_10, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_10, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_10, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_10, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_10_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_11, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_13_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_12, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_12, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_12, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_12, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_12_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_12_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_12_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_12_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_12_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_12_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_13, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_15_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_14, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_14, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_14, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_14, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_14_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_14_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_14_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_14_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_14_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_14_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_15, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_17_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_16, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_16, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_16, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_16, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_16_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_16_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_16_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_16_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_16_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_16_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_17, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_19_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_18, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_18, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_18, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_18, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_18_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_18_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_18_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_18_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_18_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_18_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_19, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_20_P, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_21_BS, ratio: 100 },],

    [{ ene: ENEMY_DEF.ENEMY_20, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_20_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_21, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_22, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_20, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_20_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_21, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_22, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_20, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_20_P, ratio: 15 }, { ene: ENEMY_DEF.ENEMY_21, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_22, ratio: 40 },],
    [{ ene: ENEMY_DEF.ENEMY_20_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_21, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_22, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_23, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_20_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_21, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_22, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_23, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_20_P, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_21, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_22, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_23, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_22, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_23, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_24, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_25, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_22, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_23, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_24, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_25, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_22, ratio: 10 }, { ene: ENEMY_DEF.ENEMY_23, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_24, ratio: 30 }, { ene: ENEMY_DEF.ENEMY_25, ratio: 30 },],
    [{ ene: ENEMY_DEF.ENEMY_26, ratio: 100 },],
];

// 名前リール
const nameCharaReel = [
    'ネ', 'ム', 'レ', 'ス', 'う', 'て', 'な', '★',
];

//
class CharaStatus {
    constructor() {
        this.eneDef = null;   // my:未使用
        this.growthType = null;
        this.name = "";
        this.exp = 0;     // my:現在の経験値 ene:獲得経験値
        this.lv = 1;
        this.maxHpLv = 0;   // Lvから求めた最大値
        this.maxHpOfs = 0;  // 『いのちのみ』による上昇分
        this.nowHp = 0;     // 現在値
        this.nowAtk = 0;       // Lvから求めた値
        this.tmpAtk = 0;    // 1ターンだけ上昇
        this.tmpAtkScf = 1;    // 1ターンだけn倍
        this.nowAgi = 0;       // Lvから求めた値
        this.tmpAgi = 0;    // 1ターンだけ上昇
        this.tmpAgiScf = 1;    // 1ターンだけn倍
        this.krt = 16;     // クリティカル確率（1000分率）。16なら約1.6%=約1/64の確率で、31なら約3.1%=約1/32の確率で『会心の一撃』が発生
        this.sleepStat = 0;     // ねむり状態（1:睡眠 0:通常 2:起床時）
        this.sleepCnt = 0;     // ねむり状態の経過ターン数
        this.statToxic = false;     // どく状態（false:通常 true:どく）
        this.statCurse = false;     // のろい状態（false:通常 true:のろい）
        this.statDarkness = 0;     // くらやみ状態（0:通常 1:くらやみ 2:まっくらやみ）
        this.cntDarkness = 0;     // くらやみ状態の経過ターン数
        this.useHealingHerbCount = 0;   // やくそう使用回数 my:未使用
        this.useMagicCount = 0;          // 巻物使用回数 my:未使用
        this.weapon = ITEM_DEF.EMPTY;
        this.shield = ITEM_DEF.EMPTY;
        this.gavasss = 0;
        this.itemList = [];
    }
    initPlayer() {
        //前提：this.name は設定済み
        this.growthType = decideGrowthType(this.name);
        this.exp = 0;
        this.lv = 1;
        let li = getLevelInfo(this.lv);
        this.maxHpLv = Math.round((li.hp * this.growthType.hp) + this.growthType.bonus);
        this.maxHpOfs = 0;
        this.nowHp = this.maxHpLv + this.maxHpOfs;
        this.nowAtk = Math.round((li.atk * this.growthType.atk) + this.growthType.bonus);
        this.tmpAtk = 0;
        this.nowAgi = Math.round((li.agi * this.growthType.agi) + this.growthType.bonus);
        this.tmpAgi = 0;
        this.krt = 16;
        this.sleepStat = 0;
        this.sleepCnt = 0;
        this.statToxic = false;
        this.statCurse = false;
        this.statDarkness = 0;
        this.cntDarkness = 0;
        this.useHealingHerbCount = 0;
        this.useMagicCount = 0;
        this.weapon = ITEM_DEF.EMPTY;
        this.shield = ITEM_DEF.EMPTY;
        this.gavasss = 0;
        this.itemList = [
            { eqp: false, def: ITEM_DEF.HERB_00 },
            { eqp: false, def: ITEM_DEF.HERB_00 },
        ];
    }
    initEnemy(enemyDef) {
        this.eneDef = enemyDef;
        this.growthType = eneGrowthTypeTable[Math.floor(Math.random() * (this.eneDef.growthTypeIdx.max - this.eneDef.growthTypeIdx.min) + this.eneDef.growthTypeIdx.min)];
        this.name = this.eneDef.name;
        this.exp = this.eneDef.exp;
        this.lv = this.eneDef.lv;
        let li = getLevelInfo(this.lv);
        if (this.eneDef.hp >= 1) {
            this.maxHpLv = this.eneDef.hp;
        } else {
            this.maxHpLv = Math.round((li.hp * this.growthType.hp) + (this.growthType.bonus));
        }
        this.maxHpOfs = 0;
        this.nowHp = this.maxHpLv + this.maxHpOfs;
        this.nowAtk = Math.round((li.atk * this.growthType.atk) + (this.growthType.bonus));
        this.tmpAtk = 0;
        this.nowAgi = Math.round((li.agi * this.growthType.agi) + (this.growthType.bonus));
        this.tmpAgi = 0;
        this.krt = this.eneDef.krtRatio;
        this.sleepStat = 0;
        this.sleepCnt = 0;
        this.statToxic = false;
        this.statCurse = false;
        this.statDarkness = 0;
        this.cntDarkness = 0;
        this.useHealingHerbCount = 0;
        this.useMagicCount = 0;
        this.weapon = ITEM_DEF.EMPTY;
        this.shield = ITEM_DEF.EMPTY;
        this.gavasss = this.eneDef.gavasss.base + Math.floor(Math.random() * this.eneDef.gavasss.ofs);
        this.itemList = [];
    }

    /* setter/getter */
    getName() {
        return this.name;
    }

    setExp(exp) {
        this.exp = exp;
    }
    addExp(exp) {
        this.exp += exp;
    }
    getExp() {
        return this.exp;
    }

    setLv(lv) {
        this.lv = lv;
    }
    getLv() {
        return this.lv;
    }

    addNowHp(addVal) {
        this.nowHp += addVal;
        if (this.nowHp > this.getMaxHp()) {
            this.nowHp = this.getMaxHp();
        } else if (this.nowHp < 0) {
            this.nowHp = 0;
        }
    }
    getNowHp() {
        return this.nowHp;
    }
    setMaxHpLv(maxHpLv) {
        this.maxHpLv = maxHpLv;
    }
    getMaxHpLv() {
        return this.maxHpLv;
    }
    addMaxHpOfs(addVal) {
        this.maxHpOfs += addVal;
    }
    getMaxHpOfs() {
        return this.maxHpOfs;
    }
    getMaxHp() {
        return this.maxHpLv + this.maxHpOfs;
    }

    getAtk() {
        return this.nowAtk + this.tmpAtk;
    }
    setNowAtk(nowAtk) {
        this.nowAtk = nowAtk;
    }
    getNowAtk() {
        return this.nowAtk;
    }
    setTmpAtk(tmpAtk) {
        this.tmpAtk = tmpAtk;
    }
    getTmpAtk() {
        return this.tmpAtk;
    }
    setTmpAtkScf(tmpAtkScf) {
        this.tmpAtkScf = tmpAtkScf;
    }
    addTmpAtkScf(tmpAtkScf) {
        this.tmpAtkScf += tmpAtkScf;
        if (this.tmpAtkScf > 2) {
            this.tmpAtkScf = 2;
        }
    }
    getTmpAtkScf() {
        return this.tmpAtkScf;
    }

    calcAttack() {
        let weaponValue = this.weapon.value;
        if (this.weapon === ITEM_DEF.WEAPON_06) {
            if (eneStatus.eneDef != null) {
                if (eneStatus.eneDef === ENEMY_DEF.ENEMY_26) {
                    weaponValue = weaponValue * 2;
                }
            }
        }
        let ret = (this.getAtk() * this.tmpAtkScf) + weaponValue;
        console.log("calcAttack=" + ret);
        return ret;
    }

    getAgi() {
        return this.nowAgi + this.tmpAgi;
    }
    setNowAgi(nowAgi) {
        this.nowAgi = nowAgi;
    }
    getNowAgi() {
        return this.nowAgi;
    }
    setTmpAgi(tmpAgi) {
        this.tmpAgi = tmpAgi;
    }
    addTmpAgi(tmpAgi) {
        this.tmpAgi += tmpAgi;
        if (this.tmpAgi > this.nowAgi) {
            this.tmpAgi = this.nowAgi;
        }
    }
    getTmpAgi() {
        return this.tmpAgi;
    }
    setTmpAgiScf(tmpAgiScf) {
        this.tmpAgiScf = tmpAgiScf;
    }
    addTmpAgiScf(tmpAgiScf) {
        this.tmpAgiScf += tmpAgiScf;
        if (this.tmpAgiScf > 1.5) {
            this.tmpAgiScf = 1.5;
        }
    }
    getTmpAgiScf() {
        return this.tmpAgiScf;
    }

    setKrt(krt) {
        this.krt = krt;
    }
    getKrt() {
        return this.krt;
    }

    setSleepStat(stat) {
        this.sleepStat = stat;
    }
    getSleepStat() {
        return this.sleepStat;
    }
    setSleepCnt(cnt) {
        this.sleepCnt = cnt;
    }
    getSleepCnt() {
        return this.sleepCnt;
    }

    calcDefence() {
        let shieldValue = this.shield.value;
        if (this.shield === ITEM_DEF.SHIELD_06) {
            if (eneStatus.eneDef != null) {
                if (eneStatus.eneDef === ENEMY_DEF.ENEMY_26) {
                    shieldValue = shieldValue * 2;
                }
            }
        }
        let ret = ((this.getAgi() / 2) * this.tmpAgiScf) + shieldValue;
        console.log("calcDefence=" + ret);
        return ret;
    }

    setWeapon(weapon) {
        this.weapon = weapon;
    }
    getWeapon() {
        return this.weapon;
    }

    setShield(shield) {
        this.shield = shield;
    }
    getShield() {
        return this.shield;
    }

    setGavasss(gavasss) {
        this.gavasss = gavasss;
    }
    addGavasss(gavasss) {
        this.gavasss += gavasss;
    }
    getGavasss() {
        return this.gavasss;
    }

    setGrowthType(growthType) {
        this.growthType = growthType;
    }
    getGrowthType() {
        return this.growthType;
    }
    addItemList(item) {
        return this.itemList.push({ eqp: false, def: item });
    }
    delItemList(idx) {
        return this.itemList.splice(idx, 1);    // idxは0オリジン
    }
    getItemList() {
        return this.itemList;
    }
}

// 表示プライオリティは 0：奥 → 4：手前 の順番
let group0 = null;  // bg
let group1 = null;  // player, enemy
let group2 = null;  // fade in / out
let group3 = null;  // status, cmd, massage
let group4 = null;  // item
let group5 = null;  // itemcmd

const DIR_KEY_DEF = defineEnum({
    NONE: {
        value: -1,
        addX: 0,
        addY: 0,
        aminBase: null,
    },
    UP: {
        value: 0,
        addX: 0,
        addY: -1,
        aminBase: null,
    },
    UP_LEFT: {
        value: 1,
        addX: -1,
        addY: -1,
        aminBase: "left",
    },
    LEFT: {
        value: 2,
        addX: -1,
        addY: 0,
        aminBase: "left",
    },
    DOWN_LEFT: {
        value: 3,
        addX: -1,
        addY: 1,
        aminBase: "left",
    },
    DOWN: {
        value: 4,
        addX: 0,
        addY: 1,
        aminBase: null,
    },
    DOWN_RIGHT: {
        value: 5,
        addX: 1,
        addY: 1,
        aminBase: "right",
    },
    RIGHT: {
        value: 6,
        addX: 1,
        addY: 0,
        aminBase: "right",
    },
    UP_RIGHT: {
        value: 7,
        addX: 1,
        addY: -1,
        aminBase: "right",
    },
});
let dirKeyRepeatTimer = 15;
let dirKey = DIR_KEY_DEF.NONE;

let player = null;
let fadeSpr = null;
var enemyArray = [];

tm.main(function () {
    // アプリケーションクラスを生成
    var app = tm.display.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);    // サイズ(解像度)設定
    app.fitWindow();                            // 自動フィッティング有効
    app.background = "rgba(77, 136, 255, 1.0)"; // 背景色
    app.fps = FPS;                              // フレーム数

    var loading = tm.ui.LoadingScene({
        assets: ASSETS,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    });

    // 読み込み完了後に呼ばれるメソッドを登録
    loading.onload = function () {
        app.replaceScene(LogoScene());
    };

    // ローディングシーンに入れ替える
    app.replaceScene(loading);

    // 実行
    app.run();
});

/*
 * ロゴ
 */
tm.define("LogoScene", {
    superClass: "tm.app.Scene",

    init: function () {
        this.superInit();
        this.fromJSON({
            children: [
                {
                    type: "Label", name: "logoLabel",
                    x: SCREEN_CENTER_X,
                    y: 320,
                    fillStyle: "#888",
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "LOGO",
                    align: "center",
                },
            ]
        });
        this.localTimer = 0;
    },

    update: function (app) {
        // 時間が来たらタイトルへ
        //        if(++this.localTimer >= 5*app.fps)
        this.app.replaceScene(TitleScene());
    }
});

/*
 * タイトル
 */
tm.define("TitleScene", {
    superClass: "tm.app.Scene",

    init: function () {
        this.superInit();
        this.fromJSON({
            children: [
                {
                    type: "Label", name: "titleLabel",
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y,
                    fillStyle: "#fff",
                    fontSize: 160,
                    fontFamily: FONT_FAMILY,
                    text: "RogueLESSS",
                    align: "center",
                },
                {
                    type: "FlatButton", name: "startButton",
                    init: [
                        {
                            text: "はじめる",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 512,
                            height: 160,
                            bgColor: "hsl(240, 0%, 70%)",
                        }
                    ],
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y + 320,
                },
            ]
        });
        this.localTimer = 0;

        var self = this;
        this.startButton.onpointingstart = function () {
            self.app.replaceScene(GameScene());
        };
    },

    update: function (app) {
        app.background = "rgba(0, 0, 0, 1.0)"; // 背景色
    }
});

/*
 * ゲーム
 */
tm.define("GameScene", {
    superClass: "tm.app.Scene",

    init: function () {
        this.superInit();

        group0 = tm.display.CanvasElement().addChildTo(this);   // BG
        group1 = tm.display.CanvasElement().addChildTo(this);   // プレイヤー、敵
        group2 = tm.display.CanvasElement().addChildTo(this);   // fade in / out
        group3 = tm.display.CanvasElement().addChildTo(this);   // status, cmd, message
        group4 = tm.display.CanvasElement().addChildTo(this);   // item
        group5 = tm.display.CanvasElement().addChildTo(this);   // itemcmd

        for (let xx = 0; xx < 9; xx++) {
            for (let yy = 0; yy < 9; yy++) {
                setBgArray(xx, yy, new BgSprite(xx, yy, 1).addChildTo(group0));
            }
        }

        player = new PlayerSprite().addChildTo(group1);
        fadeSpr = new FadeSprite().addChildTo(group2);
        fadeSpr.setAlpha(0.0);

        this.fromJSON({
            children: [
                {
                    type: "Label", name: "gameOverLabel",
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y - 32 - 16,
                    fillStyle: "#000",
                    shadowColor: "#000",
                    shadowBlur: 0,
                    fontSize: 16,
                    fontFamily: FONT_FAMILY,
                    text: "G A M E  O V E R",
                    align: "center",
                },
                {
                    type: "FlatButton", name: "tweetButton",
                    init: [
                        {
                            text: "TWEET",
                            fontFamily: FONT_FAMILY,
                            fontSize: 16,
                            width: 84,
                            height: 32,
                            bgColor: "hsl(205, 81%, 63%)",
                        }
                    ],
                    x: SCREEN_CENTER_X + 32 * 2 - 4,
                    y: SCREEN_CENTER_Y + 32 * 3 + 8,
                    alpha: 0.0,
                },
                {
                    type: "FlatButton", name: "restartButton",
                    init: [
                        {
                            text: "RESTART",
                            fontFamily: FONT_FAMILY,
                            fontSize: 16,
                            width: 120,
                            height: 32,
                            bgColor: "hsl(240, 0%, 70%)",
                        }
                    ],
                    x: SCREEN_CENTER_X - 32 * 2 + 4,
                    y: SCREEN_CENTER_Y + 32 * 3 + 8,
                    alpha: 0.0,
                },

                {
                    type: "FlatButton", name: "keyUp",
                    init: [
                        {
                            text: "↑",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 256 + 64 + 8,
                    y: 2000 - 128,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "keyUpLeft",
                    init: [
                        {
                            text: "↖",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 128,
                    y: 2000 - 128,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "keyLeft",
                    init: [
                        {
                            text: "←",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 128,
                    y: 2000 + 64 + 8,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "keyDownLeft",
                    init: [
                        {
                            text: "↙",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 128,
                    y: 2000 + 128 + 64 + 8 + 64 + 8,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "keyDown",
                    init: [
                        {
                            text: "↓",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 256 + 64 + 8,
                    y: 2000 + 128 + 64 + 8 + 64 + 8,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "keyDownRight",
                    init: [
                        {
                            text: "↘",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 384 + 64 + 8 + 64 + 8,
                    y: 2000 + 128 + 64 + 8 + 64 + 8,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "keyRight",
                    init: [
                        {
                            text: "→",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 384 + 64 + 8 + 64 + 8,
                    y: 2000 + 64 + 8,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "keyUpRight",
                    init: [
                        {
                            text: "↗",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 384 + 64 + 8 + 64 + 8,
                    y: 2000 - 128,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "buttonA",
                    init: [
                        {
                            text: "A",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 384 + 128 * 3,
                    y: 2000,
                    alpha: 1.0,
                },
                {
                    type: "FlatButton", name: "buttonB",
                    init: [
                        {
                            text: "B",
                            fontFamily: FONT_FAMILY,
                            fontSize: 96,
                            width: 192,
                            height: 192,
                            bgColor: "hsl(0, 100%, 50%)",
                        }
                    ],
                    x: 384 + 128 * 5,
                    y: 2000,
                    alpha: 1.0,
                },
            ]
        });

        this.tweetButton.sleep();
        this.restartButton.sleep();

        var self = this;
        this.restartButton.onpointingstart = function () {
            self.app.replaceScene(GameScene());
        };

        this.keyUp.sleep();
        this.keyUp.onpointingstart = function () {
            dirKeyProcStart(DIR_KEY_DEF.UP);
        };
        this.keyUp.onpointingmove = function () {
            dirKeyProcMove(DIR_KEY_DEF.UP);
        };
        this.keyUp.onpointingend = function () {
            dirKeyProcEnd(DIR_KEY_DEF.UP);
        };

        this.keyUpLeft.sleep();
        this.keyUpLeft.onpointingstart = function () {
            dirKeyProcStart(DIR_KEY_DEF.UP_LEFT);
        }
        this.keyUpLeft.onpointingmove = function () {
            dirKeyProcMove(DIR_KEY_DEF.UP_LEFT);
        };
        this.keyUpLeft.onpointingend = function () {
            dirKeyProcEnd(DIR_KEY_DEF.UP_LEFT);
        };

        this.keyLeft.sleep();
        this.keyLeft.onpointingstart = function () {
            dirKeyProcStart(DIR_KEY_DEF.LEFT);
        }
        this.keyLeft.onpointingmove = function () {
            dirKeyProcMove(DIR_KEY_DEF.LEFT);
        };
        this.keyLeft.onpointingend = function () {
            dirKeyProcEnd(DIR_KEY_DEF.LEFT);
        };

        this.keyDownLeft.sleep();
        this.keyDownLeft.onpointingstart = function () {
            dirKeyProcStart(DIR_KEY_DEF.DOWN_LEFT);
        }
        this.keyDownLeft.onpointingmove = function () {
            dirKeyProcMove(DIR_KEY_DEF.DOWN_LEFT);
        };
        this.keyDownLeft.onpointingend = function () {
            dirKeyProcEnd(DIR_KEY_DEF.DOWN_LEFT);
        };

        this.keyDown.sleep();
        this.keyDown.onpointingstart = function () {
            dirKeyProcStart(DIR_KEY_DEF.DOWN);
        };
        this.keyDown.onpointingmove = function () {
            dirKeyProcMove(DIR_KEY_DEF.DOWN);
        };
        this.keyDown.onpointingend = function () {
            dirKeyProcEnd(DIR_KEY_DEF.DOWN);
        };

        this.keyDownRight.sleep();
        this.keyDownRight.onpointingstart = function () {
            dirKeyProcStart(DIR_KEY_DEF.DOWN_RIGHT);
        };
        this.keyDownRight.onpointingmove = function () {
            dirKeyProcMove(DIR_KEY_DEF.DOWN_RIGHT);
        };
        this.keyDownRight.onpointingend = function () {
            dirKeyProcEnd(DIR_KEY_DEF.DOWN_RIGHT);
        };

        this.keyRight.sleep();
        this.keyRight.onpointingstart = function () {
            dirKeyProcStart(DIR_KEY_DEF.RIGHT);
        };
        this.keyRight.onpointingmove = function () {
            dirKeyProcMove(DIR_KEY_DEF.RIGHT);
        };
        this.keyRight.onpointingend = function () {
            dirKeyProcEnd(DIR_KEY_DEF.RIGHT);
        };

        this.keyUpRight.sleep();
        this.keyUpRight.onpointingstart = function () {
            dirKeyProcStart(DIR_KEY_DEF.UP_RIGHT);
        };
        this.keyUpRight.onpointingmove = function () {
            dirKeyProcMove(DIR_KEY_DEF.UP_RIGHT);
        };
        this.keyUpRight.onpointingend = function () {
            dirKeyProcEnd(DIR_KEY_DEF.UP_RIGHT);
        };

        // A
        this.buttonA.sleep();
        this.buttonA.onpointingstart = function () {
            buttonA();
        };

        // B
        this.buttonB.sleep();
        this.buttonB.onpointingstart = function () {
            buttonB();
        };

        this.buttonAlpha = 0.0;

        // マップ作成
        makeMap();

        frame = 0;
    },

    // main loop
    update: function (app) {

        if (player.status === PL_STATUS.DEAD) {
            var self = this;
            // tweet ボタン
            this.tweetButton.onclick = function () {
                var twitterURL = tm.social.Twitter.createURL({
                    type: "tweet",
                    text: "あいうえお",
                    hashtags: ["ネムレス", "NEMLESSS"],
                    url: "https://iwasaku.github.io/test2/RogueLESSS/",
                });
                window.open(twitterURL);
            };

            this.keyUp.sleep();
            this.keyUpLeft.sleep();
            this.keyLeft.sleep();
            this.keyDownLeft.sleep();
            this.keyDown.sleep();
            this.keyUpRight.sleep();
            this.keyRight.sleep();
            this.keyDownRight.sleep();
            this.buttonA.wakeUp();
            this.buttonB.wakeUp();

            this.buttonAlpha += 0.05;
            if (this.buttonAlpha > 1.0) {
                this.buttonAlpha = 1.0;
            }
            this.gameOverLabel.setAlpha(this.buttonAlpha);
            this.tweetButton.setAlpha(this.buttonAlpha);
            this.restartButton.setAlpha(this.buttonAlpha);
            if (this.buttonAlpha > 0.7) {
                this.tweetButton.wakeUp();
                this.restartButton.wakeUp();
            }
        } else {
            if (!player.status.isStarted) {
                this.gameOverLabel.setAlpha(0.0);
                this.keyUp.setAlpha(1.0);
                this.keyUpLeft.setAlpha(1.0);
                this.keyLeft.setAlpha(1.0);
                this.keyDownLeft.setAlpha(1.0);
                this.keyDown.setAlpha(1.0);
                this.keyDownRight.setAlpha(1.0);
                this.keyRight.setAlpha(1.0);
                this.keyUpRight.setAlpha(1.0);
                this.buttonA.setAlpha(1.0);
                this.buttonB.setAlpha(1.0);

                this.keyUp.wakeUp();
                this.keyUpLeft.wakeUp();
                this.keyLeft.wakeUp();
                this.keyDownLeft.wakeUp();
                this.keyDown.wakeUp();
                this.keyDownRight.wakeUp();
                this.keyRight.wakeUp();
                this.keyUpRight.wakeUp();
                this.buttonA.wakeUp();
                this.buttonB.wakeUp();

                player.status = PL_STATUS.START;
            }
            do {
                if (player.status === PL_STATUS.FADE_OUT) {
                    player.fadeCounter--;
                    if (player.fadeCounter % 5 === 0) {
                        let alphaVal = 1.0 - (player.fadeCounter / 30.0);
                        if (alphaVal > 1.0) {
                            alphaVal = 1.0;
                        }
                        fadeSpr.setAlpha(alphaVal);  // 0.0→1.0
                    }
                    if (player.fadeCounter == 0) {
                        // フェード・アウトが完了したらマップを生成する
                        makeMap();
                        player.status = PL_STATUS.FADE_IN;
                        fadeSpr.setAlpha(1.0);
                        player.fadeCounter = 30;
                    }
                    break;
                }
                if (player.status === PL_STATUS.FADE_IN) {
                    player.fadeCounter--;
                    if (player.fadeCounter % 5 === 0) {
                        let alphaVal = (player.fadeCounter / 30.0);  // 1.0→0.0
                        if (alphaVal < 0.0) {
                            alphaVal = 0.0;
                        }
                        fadeSpr.setAlpha(alphaVal);
                    }
                    if (player.fadeCounter == 0) {
                        // フェード・イン完了したら再START
                        player.status = PL_STATUS.START;
                        fadeSpr.setAlpha(0.0);
                    }
                    break;
                }
                break;
            } while (false);

            // プレイヤーの座標からマップの表示範囲を更新
            for (let xx = -1; xx <= 1; xx++) {
                for (let yy = -1; yy <= 1; yy++) {
                    setViewArray(player.mapX + xx, player.mapY + yy, 1);
                }
            }

            // プレイヤーの座標とマップの表示範囲からBGを更新
            // プレイヤーの現在位置の情報を取得
            let playerBgMcd = getMapChipDef(player.mapX, player.mapY);
            let playerRegion = null;
            for (let mr of mapRegionList) {
                if (mr.checkActual(player.mapX, player.mapY)) {
                    playerRegion = mr;
                    break;
                }
            }
            for (let xx = -4; xx <= 4; xx++) {
                for (let yy = -4; yy <= 4; yy++) {
                    let bgMcd;
                    let tmpXpos = player.mapX + xx;
                    let tmpYpos = player.mapY + yy;
                    if (getViewArray(tmpXpos, tmpYpos) === 1) {
                        bgMcd = getMapChipDef(tmpXpos, tmpYpos);
                    } else {
                        bgMcd = MAP_CHIP_DEF.DARK;
                    }
                    for (; ;) {
                        if (bgMcd === MAP_CHIP_DEF.DARK) break;
                        if (playerBgMcd.isRoom) {
                            // プレイヤーが部屋にいる時は通路はDARK
                            if (bgMcd.isPath) {
                                bgMcd = MAP_CHIP_DEF.DARK;
                                break;
                            }
                            if (!playerBgMcd.brightness) {
                                // プレイヤーの足元が暗闇属性の場合は自分の周囲８マスのみ
                                if ((xx < -1) || (xx > 1) && (yy < -1) && (yy > 1)) {
                                    if (bgMcd.isFllor || bgMcd.isPath) {
                                        bgMcd = MAP_CHIP_DEF.DARK;
                                        break;
                                    }
                                }
                            }
                        } else {
                            // プレイヤーが通路にいる時は全ての部屋の床はDARK
                            if (bgMcd.isFloor) {
                                bgMcd = MAP_CHIP_DEF.DARK;
                                break;
                            }
                            if (!playerBgMcd.brightness) {
                                // プレイヤーの足元が暗闇属性の場合は自分の周囲８マスのみ
                                if ((xx < -1) || (xx > 1) || (yy < -1) || (yy > 1)) {
                                    if (bgMcd.isFllor || bgMcd.isPath) {
                                        bgMcd = MAP_CHIP_DEF.DARK;
                                        break;
                                    }
                                }
                            }
                        }
                        if (bgMcd.isFloor) {
                            //プレイヤーがいるリージョン以外の部屋の床はDARK
                            if (!playerRegion.checkActual(tmpXpos, tmpYpos)) {
                                bgMcd = MAP_CHIP_DEF.DARK;
                                break;
                            }
                        }
                        break;
                    }

                    getBgArray(4 + xx, 4 + yy).gotoAndPlay("" + bgMcd.value);
                }
            }
        }

        ++frame;
    }
});

/*
 * Player
 */
tm.define("PlayerSprite", {
    superClass: "tm.app.AnimationSprite",

    /*
        init: function () {
            this.superInit("player", 128, 128);
            this.direct = '';
            this.setInteractive(false);
            this.setBoundingType("rect");
            this.alpha = 1.0;
            this.x = 96 + 4 * 128;
            this.y = 256 + 4 * 128;
    
            this.status = PL_STATUS.INIT;
            this.mapX = 0;
            this.mapY = 0;
            this.mapDepth = 1;  // 地下1階
            this.fadeCounter = 0;
        },
    */
    init: function () {
        let ss = tm.asset.SpriteSheet({
            // 画像
            image: "player",
            // １コマのサイズ指定および全コマ数
            frame: {
                width: 128,
                height: 128,
                count: 5
            },
            // アニメーションの定義（開始コマ、終了コマ+1、次のアニメーション,wait）
            animations: {
                "left0": [0, 1, "left0", 1],
                "left1": [1, 2, "left1", 1],
                "right0": [2, 3, "right0", 1],
                "right1": [3, 4, "right1", 1],
            }
        });

        this.superInit(ss, 128, 128);
        this.direct = '';
        this.zRot = 0;
        this.setPosition(96 + 4 * 128, 256 + 4 * 128).setScale(1, 1);
        this.setInteractive(false);
        this.setBoundingType("rect");
        this.gotoAndPlay("left0");
        this.alpha = 1.0;

        this.status = PL_STATUS.INIT;
        this.mapX = 0;
        this.mapY = 0;
        this.mapDepth = 1;  // 地下1階
        this.fadeCounter = 0;
        this.aminBase = "left";
        this.aminCount = 0;
    },

    update: function (app) {
    },
});

/*
 * マップ用スプライトの定義
 */
tm.define("BgSprite", {
    superClass: "tm.app.AnimationSprite",

    init: function (xPos, yPos, kind) {
        let ss = tm.asset.SpriteSheet({
            // 画像
            image: "bg",
            // １コマのサイズ指定および全コマ数
            frame: {
                width: 128,
                height: 128,
                count: 14
            },
            // アニメーションの定義（開始コマ、終了コマ+1、次のアニメーション,wait）
            animations: {
                "0": [0, 1, "0", 1],
                "1": [1, 2, "1", 1],
                "2": [2, 3, "2", 1],
                "3": [3, 4, "3", 1],
                "4": [4, 5, "4", 1],
                "5": [5, 6, "5", 1],
                "6": [6, 7, "6", 1],
                "7": [7, 8, "7", 1],
                "8": [8, 9, "8", 1],
                "9": [9, 10, "9", 1],
                "10": [10, 11, "10", 1],
                "11": [11, 12, "11", 1],
                "12": [12, 13, "12", 1],
                "13": [13, 14, "13", 1],
            }
        });

        this.superInit(ss, 128, 128);
        this.direct = '';
        this.zRot = 0;
        this.setPosition(96 + (xPos * 128), 256 + (yPos * 128)).setScale(1, 1);
        this.setInteractive(false);
        this.setBoundingType("rect");
        this.gotoAndPlay("0");
        this.alpha = 1;
        this.kind = kind;
    },

    update: function (app) {
    },
});

tm.define("FadeSprite", {
    superClass: "tm.app.Sprite",

    init: function () {
        this.superInit("fade", 1152, 1152);
        this.direct = '';
        this.setInteractive(false);
        this.setBoundingType("rect");
        this.alpha = 1.0;
        this.x = 96 + 4 * 128;
        this.y = 256 + 4 * 128;
    },

    update: function (app) {
    },
});

// 自キャラ移動
function dirKeyProcStart(dkDef) {
    if (dirKey !== DIR_KEY_DEF.NONE) return;
    dirKey = dkDef;
    dirKeyRepeatTimer = 15;
    dirKeyProcInternal(dirKey);
}
function dirKeyProcMove(dkDef) {
    if (dirKey !== dkDef) return;
    if (--dirKeyRepeatTimer < 0) {
        dirKeyRepeatTimer = 3;
        dirKeyProcInternal(dirKey);
    }
}
function dirKeyProcEnd(dkDef) {
    if (dirKey !== dkDef) return;
    dirKey = DIR_KEY_DEF.NONE;
}

function dirKeyProcInternal(dkDef) {
    if (!player.status.isAccKey) return;
    let moveFlag = false;
    let oldX = player.mapX;
    let oldY = player.mapY;
    player.mapX += dkDef.addX;
    player.mapY += dkDef.addY;
    do {
        if (player.mapX < 4) break;
        if (player.mapY < 4) break;
        if (chkMapColi(player.mapX, player.mapY)) break;
        moveFlag = true;
        if (++player.aminCount > 1) player.aminCount = 0;
        if (dkDef.aminBase !== null) {
            player.aminBase = dkDef.aminBase;
        }
        console.log(player.aminBase + player.aminCount);
        player.gotoAndPlay(player.aminBase + player.aminCount);
    } while (false);
    if (!moveFlag) {
        player.mapX = oldX;
        player.mapY = oldY;
    }
}

function buttonA() {
    if (!player.status.isAccKey) return;
    do {
        // プレイヤー足元チェック
        let mapKind = getMapArray(player.mapX, player.mapY);
        if (mapKind == 4) {
            // 下り階段
            if (player.mapDepth <= 100) {
                console.log("down");
                player.status = PL_STATUS.FADE_OUT;
                player.fadeCounter = 35;
                player.mapDepth++;
            }
            break;
        }
        if (mapKind == 5) {
            // 上り階段
            if (player.mapDepth >= 1) {
                console.log("up");
                player.status = PL_STATUS.FADE_OUT;
                player.fadeCounter = 35;
                player.mapDepth--;
            }
            break;
        }
        if (mapKind == 6) {
            // 宝箱
            console.log("unbox");
            break;
        }

        // プレイヤーの周囲８マスをチェック
        // 0:闇 1:扉 2:床 3:道 4:下り 5:上り 6:宝箱 7:壁０ 8:壁１ 
        chkLoop: for (let xx = -1; xx <= 1; xx++) {
            for (let yy = -1; yy <= 1; yy++) {
                if ((xx === 0) && (yy === 0)) continue;
                mapKind = getMapArray(player.mapX + xx, player.mapY + yy);
                if ((mapKind === 9) || (mapKind === 10)) {
                    // 隠し扉
                    setMapArray(player.mapX + xx, player.mapY + yy, 1);
                    break chkLoop;
                }
                if (mapKind === 11) {
                    // 罠(床)
                    setMapArray(player.mapX + xx, player.mapY + yy, 1);
                    break chkLoop;
                }
                if (mapKind === 12) {
                    // 罠(道)
                    setMapArray(player.mapX + xx, player.mapY + yy, 3);
                    break chkLoop;
                }
                if (mapKind === 13) {
                    // 罠(宝箱)
                    setMapArray(player.mapX + xx, player.mapY + yy, 6);
                    break chkLoop;
                }
            }
        }

    } while (false);

}
function buttonB() {
    if (!player.status.isAccKey) return;
}

class RoomInfo {
    constructor(xPos, yPos, xSize, ySize) {
        // 左上座標
        this.xPos = xPos;
        this.yPos = yPos;
        // 辺の長さ
        this.xSize = xSize;
        this.ySize = ySize;
    }
}
class MapRegion {
    constructor(xPos, yPos, xSize, ySize) {
        // 左上座標
        this.xPos = xPos;
        this.yPos = yPos;
        // 辺の長さ
        this.xSize = xSize;
        this.ySize = ySize;

        // 次のリージョン(0:上 1:下 2:左 3:右)
        this.nextDir = -1;

        // ルームの情報
        this.room = null;
    }

    /**
     * リージョン内外判定
     * ※境界線を含む
     * @param {*} xx 
     * @param {*} yy 
     */
    check(xx, yy) {
        return this.checkInternal(xx, yy, 0);
    }

    /**
     * リージョン内外判定
     * ※境界線を含まない
     * ※入力はmapArrayの座標
     * @param {*} xx 
     * @param {*} yy 
     */
    checkActual(xx, yy) {
        return this.checkInternal(xx - 4, yy - 4, 1);
    }

    /**
     * 下請け
     * @param {*} xx 
     * @param {*} yy 
     * @param {*} ofs 
     */
    checkInternal(xx, yy, ofs) {
        if (xx < this.xPos + ofs) return false;
        if (xx > this.xPos + this.xSize - 1 - ofs) return false;
        if (yy < this.yPos + ofs) return false;
        if (yy > this.yPos + this.ySize - 1 - ofs) return false;
        return true;
    }
}
let mapRegionList = [];

function makeMap() {
    // mapArrayの初期化
    initMapArray();

    // mapArrayの自動生成
    // リージョン分割
    mapRegionList = [];
    initDebugArray(".");
    divRegion();
    console.log("divRegion");
    printDebugArray();

    // 部屋の作成
    initDebugArray(".");
    makeRoom();
    console.log("makeRoom");
    printDebugArray();

    // 扉と通路の作成
    makeDoorAndPath();
    //    console.log("makeDoorAndPath");
    //    printDebugArray();

    // 階段の配置
    setStair();
    //    console.log("setStair");
    //    printDebugArray();

    // 宝箱の配置
    setTreasureBox();
    //    console.log("setTreasureBox");
    //    printDebugArray();

    // 罠の配置
    setTrap();
    //    console.log("setTrap");
    //    printDebugArray();

    // 隠し扉に変換
    setSecretDoor();
    //    console.log("setSecretDoor");
    //    printDebugArray();

    // 敵の配置
    setEnemy();
    //    console.log("setEnemy");
    //    printDebugArray();

    // プレイヤーの配置
    setPlayerMapPos();

    // mapArrayに配置した制御用のMAP_CHIPを消す
    cleanUpCtrlMapChip();
    console.log("FINISH");
    console.log(">>>Debug");
    printDebugArray();
    console.log(">>>Map");
    printMapArray();

    // viewArrayの初期化
    initViewArray();
}

const MIN_REGION_X_SIZE = 7;
const MIN_REGION_Y_SIZE = 7;
const MAX_REGION_DIV_COUNT = 10;
function divRegion() {
    let divDir = true; // true:縦 false:横
    let divCnt = 0; // 分割回数
    let orgRagion = new MapRegion(0, 0, MAP_WIDTH - (4 + 4), MAP_HEIGHT - (4 + 4));
    do {
        let tmpRagion = null;
        if (divDir) {
            if (orgRagion.xSize >= MIN_REGION_X_SIZE * 2) { // 分割してそれぞれが7以上必要
                let xs0 = getRandomInt(orgRagion.xSize - (MIN_REGION_X_SIZE * 2)) + 7;
                let xs1 = (orgRagion.xSize - xs0) + 1;
                let tmpRegion0 = new MapRegion(orgRagion.xPos, orgRagion.yPos, xs0, orgRagion.ySize);
                let tmpRegion1 = new MapRegion((orgRagion.xPos + xs0) - 1, orgRagion.yPos, xs1, orgRagion.ySize);    // tmpRegion0とtmpRegion1辺を共有するのでxposを-1しておく
                if (xs0 >= xs1) {
                    // xs0側を残す
                    orgRagion = tmpRegion0;
                    tmpRagion = tmpRegion1;
                    tmpRagion.nextDir = 3;
                } else {
                    // xs1側を残す
                    orgRagion = tmpRegion1;
                    tmpRagion = tmpRegion0;
                    tmpRagion.nextDir = 2;
                }
            }
        } else {
            if (orgRagion.ySize >= MIN_REGION_Y_SIZE * 2) { // 分割してそれぞれが7以上必要
                let ys0 = getRandomInt(orgRagion.ySize - (MIN_REGION_Y_SIZE * 2)) + 6;
                let ys1 = (orgRagion.ySize - ys0) + 1;    // tmpRegion0とtmpRegion1辺を共有するのでサイズを+1しておく
                let tmpRegion0 = new MapRegion(orgRagion.xPos, orgRagion.yPos, orgRagion.xSize, ys0);
                let tmpRegion1 = new MapRegion(orgRagion.xPos, (orgRagion.yPos + ys0) - 1, orgRagion.xSize, ys1);    // tmpRegion0とtmpRegion1辺を共有するのでyposを+1しておく
                if (ys0 >= ys1) {
                    // ys0側を残す
                    orgRagion = tmpRegion0;
                    tmpRagion = tmpRegion1;
                    tmpRagion.nextDir = 1;
                } else {
                    // ys1側を残す
                    orgRagion = tmpRegion1;
                    tmpRagion = tmpRegion0;
                    tmpRagion.nextDir = 0;
                }
            }
        }
        divDir = !divDir;   // 縦横入れ替え

        if (tmpRagion !== null) {
            mapRegionList.push(tmpRagion);
        }

        // 終了証券
        if ((orgRagion.xSize < (MIN_REGION_X_SIZE * 2)) && (orgRagion.ySize < (MIN_REGION_Y_SIZE * 2))) {
            // XY両方分割できなくなった
            mapRegionList.push(orgRagion);
            break;
        }
        if (++divCnt > MAX_REGION_DIV_COUNT) {
            // 分割回数上限になった
            mapRegionList.push(orgRagion);
            break;
        }
    } while (true);

    // ここから確認用
    {
        for (let mr of mapRegionList) {
            console.log(mr);
        }
        initDebugArray(",");
        let idx = 0;
        for (let mr of mapRegionList) {
            for (let xx = 0; xx < mr.xSize; xx++) {
                for (let yy = 0; yy < mr.ySize; yy++) {
                    let xp = mr.xPos + xx + 4;
                    let yp = mr.yPos + yy + 4;
                    if ((xx === 0) || (xx === mr.xSize - 1) || (yy === 0) || (yy === mr.ySize - 1)) {
                        setDebugArray(xp, yp, "#");
                    } else {
                        setDebugArray(xp, yp, "" + idx.toString(16));
                    }
                }
            }
            idx++;
        }
    }
}

const MIN_ROOM_X_SIZE = 5;
const MIN_ROOM_Y_SIZE = 5;
function makeRoom() {
    for (let mr of mapRegionList) {
        // ルームサイズの決定
        let xs = getRandomInt(mr.xSize - 2 - MIN_ROOM_X_SIZE) + MIN_ROOM_X_SIZE;    // 左右分割線を除く＆最低4マス確保
        let ys = getRandomInt(mr.ySize - 2 - MIN_ROOM_Y_SIZE) + MIN_ROOM_Y_SIZE;    // 上下分割線を除く＆最低4マス確保

        // リージョン内に配置
        let xp = getRandomInt(mr.xSize - xs - 1 - 2) + 1;
        if (xp < 1) xp = 1;
        let yp = getRandomInt(mr.ySize - ys - 1 - 2) + 1;
        if (yp < 1) yp = 1;
        mr.room = new RoomInfo(mr.xPos + xp, mr.yPos + yp, xs, ys);
    }

    // 作成
    let idx = 0;
    for (let mr of mapRegionList) {
        for (let xx = 0; xx < mr.room.xSize; xx++) {
            for (let yy = 0; yy < mr.room.ySize; yy++) {
                let xp = mr.room.xPos + xx + 4;
                let yp = mr.room.yPos + yy + 4;
                if ((xx === 0) || (xx === mr.room.xSize - 1) || (yy === 0) || (yy === mr.room.ySize - 1)) {
                    if ((xx === 0) || (xx === mr.room.xSize - 1)) {
                        if (yy === mr.room.ySize - 1) {
                            setMapArray(xp, yp, MAP_CHIP_DEF.WALL_1.value);
                            debugArray[yp][xp] = "-";
                        } else {
                            setMapArray(xp, yp, MAP_CHIP_DEF.WALL_0.value);
                            debugArray[yp][xp] = "|";
                        }
                    } else {
                        setMapArray(xp, yp, MAP_CHIP_DEF.WALL_1.value);
                        debugArray[yp][xp] = "-";
                    }
                } else {
                    setMapArray(xp, yp, MAP_CHIP_DEF.FLOOR.value);
                    debugArray[yp][xp] = "" + idx.toString(16);
                }
            }
        }
        idx++;
    }

    // ここから確認用
    {
        for (let mr of mapRegionList) {
            console.log(mr);
        }
    }
}

function makeDoorAndPath() {
    for (let idx = 0; idx < mapRegionList.length - 1; idx++) {
        let region0 = mapRegionList[idx];
        let region1 = mapRegionList[idx + 1];
        switch (region0.nextDir) {
            case 0:
                // 上→下
                console.log("region[" + (idx) + "]が上、region[" + (idx + 1) + "]が下");
                {
                    // region0.roomの下辺にドア作成
                    let d0xp = region0.room.xPos + getRandomInt(region0.room.xSize - 2) + 1;
                    let d0yp = region0.room.yPos + region0.room.ySize - 1;
                    setMapArray(d0xp + 4, d0yp + 4, MAP_CHIP_DEF.DOOR.value);
                    setDebugArray(d0xp + 4, d0yp + 4, "+");
                    // ドアから下方向へ仕切り線まで道を伸ばす
                    let p0yp;
                    for (p0yp = d0yp + 1; p0yp <= region0.yPos + region0.ySize - 1; p0yp++) {
                        setMapArray(d0xp + 4, p0yp + 4, MAP_CHIP_DEF.PATH.value);
                        setDebugArray(d0xp + 4, p0yp + 4, "#");
                    }
                    p0yp--;
                    // region1.roomの上辺にドア作成
                    let d1xp = region1.room.xPos + getRandomInt(region1.room.xSize - 2) + 1;
                    let d1yp = region1.room.yPos;
                    setMapArray(d1xp + 4, d1yp + 4, MAP_CHIP_DEF.DOOR.value);
                    setDebugArray(d1xp + 4, d1yp + 4, "+");
                    // ドアから上方向へ仕切り線まで道を伸ばす
                    let p1yp;
                    for (p1yp = d1yp - 1; p1yp >= region1.yPos; p1yp--) {
                        setMapArray(d1xp + 4, p1yp + 4, MAP_CHIP_DEF.PATH.value);
                        setDebugArray(d1xp + 4, p1yp + 4, "#");
                    }
                    p1yp++;
                    // 接続する仕切り線を道にする
                    if (d0xp < d1xp) {
                        for (let pxp = d0xp; pxp <= d1xp; pxp++) {
                            setMapArray(pxp + 4, p0yp + 4, MAP_CHIP_DEF.PATH.value);
                            setDebugArray(pxp + 4, p0yp + 4, "#");
                        }
                    } else if (d0xp > d1xp) {
                        for (let pxp = d1xp; pxp <= d0xp; pxp++) {
                            setMapArray(pxp + 4, p1yp + 4, MAP_CHIP_DEF.PATH.value);
                            setDebugArray(pxp + 4, p1yp + 4, "#");
                        }
                    }
                }
                break;
            case 1:
                // 下→上
                console.log("region[" + (idx) + "]が下、region[" + (idx + 1) + "]が上");
                {
                    // region0.roomの上辺にドア作成
                    let d0xp = region0.room.xPos + getRandomInt(region0.room.xSize - 2) + 1;
                    let d0yp = region0.room.yPos;
                    setMapArray(d0xp + 4, d0yp + 4, MAP_CHIP_DEF.DOOR.value);
                    setDebugArray(d0xp + 4, d0yp + 4, "+");
                    // ドアから上方向へ仕切り線まで道を伸ばす
                    let p0yp;
                    for (p0yp = d0yp - 1; p0yp >= region0.yPos; p0yp--) {
                        setMapArray(d0xp + 4, p0yp + 4, MAP_CHIP_DEF.PATH.value);
                        setDebugArray(d0xp + 4, p0yp + 4, "#");
                    }
                    p0yp++;
                    // region1.roomの下辺にドア作成
                    let d1xp = region1.room.xPos + getRandomInt(region1.room.xSize - 2) + 1;
                    let d1yp = region1.room.yPos + region1.room.ySize - 1;
                    setMapArray(d1xp + 4, d1yp + 4, MAP_CHIP_DEF.DOOR.value);
                    setDebugArray(d1xp + 4, d1yp + 4, "+");
                    // ドアから下方向へ仕切り線まで道を伸ばす
                    let p1yp;
                    for (p1yp = d1yp + 1; p1yp <= region1.yPos + region1.ySize - 1; p1yp++) {
                        setMapArray(d1xp + 4, p1yp + 4, MAP_CHIP_DEF.PATH.value);
                        setDebugArray(d1xp + 4, p1yp + 4, "#");
                    }
                    p1yp--;
                    // 接続する仕切り線を道にする
                    if (d0xp < d1xp) {
                        for (let pxp = d0xp; pxp <= d1xp; pxp++) {
                            setMapArray(pxp + 4, p0yp + 4, MAP_CHIP_DEF.PATH.value);
                            setDebugArray(pxp + 4, p0yp + 4, "#");
                        }
                    } else if (d0xp > d1xp) {
                        for (let pxp = d1xp; pxp <= d0xp; pxp++) {
                            setMapArray(pxp + 4, p1yp + 4, MAP_CHIP_DEF.PATH.value);
                            setDebugArray(pxp + 4, p1yp + 4, "#");
                        }
                    }
                }
                break;
            case 2:
                // 左→右
                console.log("region[" + (idx) + "]が左、region[" + (idx + 1) + "]が右");
                {
                    // region1.roomの右辺にドア作成
                    let d0xp = region0.room.xPos + region0.room.xSize - 1;
                    let d0yp = region0.room.yPos + getRandomInt(region0.room.ySize - 2) + 1;
                    setMapArray(d0xp + 4, d0yp + 4, MAP_CHIP_DEF.DOOR.value);
                    setDebugArray(d0xp + 4, d0yp + 4, "+");

                    // ドアから右方向へ仕切り線まで道を伸ばす
                    let p0xp;
                    for (p0xp = d0xp + 1; p0xp <= region0.xPos + region0.xSize - 1; p0xp++) {
                        setMapArray(p0xp + 4, d0yp + 4, MAP_CHIP_DEF.PATH.value);
                        setDebugArray(p0xp + 4, d0yp + 4, "#");
                    }
                    p0xp--;

                    // region1.roomの左辺にドア作成
                    let d1xp = region1.room.xPos;
                    let d1yp = region1.room.yPos + getRandomInt(region1.room.ySize - 2) + 1;
                    setMapArray(d1xp + 4, d1yp + 4, MAP_CHIP_DEF.DOOR.value);
                    setDebugArray(d1xp + 4, d1yp + 4, "+");

                    // ドアから左方向へ仕切り線まで道を伸ばす
                    let p1xp;
                    for (p1xp = d1xp - 1; p1xp >= region1.xPos; p1xp--) {
                        setMapArray(p1xp + 4, d1yp + 4, MAP_CHIP_DEF.PATH.value);
                        setDebugArray(p1xp + 4, d1yp + 4, "#");
                    }
                    p1xp++;

                    // 接続する仕切り線を道にする
                    if (d0yp < d1yp) {
                        for (let pyp = d0yp; pyp <= d1yp; pyp++) {
                            setMapArray(p0xp + 4, pyp + 4, MAP_CHIP_DEF.PATH.value);
                            setDebugArray(p0xp + 4, pyp + 4, "#");
                        }
                    } else if (d0yp > d1yp) {
                        for (let pyp = d1yp; pyp <= d0yp; pyp++) {
                            setMapArray(p1xp + 4, pyp + 4, MAP_CHIP_DEF.PATH.value);
                            setDebugArray(p1xp + 4, pyp + 4, "#");
                        }
                    }
                }
                break;
            case 3:
                // 右→左
                console.log("region[" + (idx) + "]が右、region[" + (idx + 1) + "]が左");
                {
                    // region1.roomの左辺にドア作成
                    let d0xp = region0.room.xPos;
                    let d0yp = region0.room.yPos + getRandomInt(region0.room.ySize - 2) + 1;
                    setMapArray(d0xp + 4, d0yp + 4, MAP_CHIP_DEF.DOOR.value);
                    setDebugArray(d0xp + 4, d0yp + 4, "+");

                    // ドアから左方向へ仕切り線まで道を伸ばす
                    let p0xp;
                    for (p0xp = d0xp - 1; p0xp >= region0.xPos; p0xp--) {
                        setMapArray(p0xp + 4, d0yp + 4, MAP_CHIP_DEF.PATH.value);
                        setDebugArray(p0xp + 4, d0yp + 4, "#");
                    }
                    p0xp++;

                    // region1.roomの右辺にドア作成
                    let d1xp = region1.room.xPos + region1.room.xSize - 1;
                    let d1yp = region1.room.yPos + getRandomInt(region1.room.ySize - 2) + 1;
                    setMapArray(d1xp + 4, d1yp + 4, MAP_CHIP_DEF.DOOR.value);
                    setDebugArray(d1xp + 4, d1yp + 4, "+");

                    // ドアから右方向へ仕切り線まで道を伸ばす
                    let p1xp;
                    for (p1xp = d1xp + 1; p1xp <= region1.xPos + region1.xSize - 1; p1xp++) {
                        setMapArray(p1xp + 4, d1yp + 4, MAP_CHIP_DEF.PATH.value);
                        setDebugArray(p1xp + 4, d1yp + 4, "#");
                    }
                    p1xp--;

                    // 仕切り線を道にする
                    if (d0yp < d1yp) {
                        for (let pyp = d0yp; pyp <= d1yp; pyp++) {
                            setMapArray(p0xp + 4, pyp + 4, MAP_CHIP_DEF.PATH.value);
                            setDebugArray(p0xp + 4, pyp + 4, "#");
                        }
                    } else if (d0yp > d1yp) {
                        for (let pyp = d1yp; pyp <= d0yp; pyp++) {
                            setMapArray(p1xp + 4, pyp + 4, MAP_CHIP_DEF.PATH.value);
                            setDebugArray(p1xp + 4, pyp + 4, "#");
                        }
                    }
                }
                break;
        }
    }
}

/**
 * 
 */
function setStair() {
    for (; ;) {
        let xx = getRandomInt(MAP_WIDTH);
        let yy = getRandomInt(MAP_HEIGHT);
        let mcd = MAP_CHIP_DEF.getByValue('value', getMapArray(xx, yy));
        if (mcd !== MAP_CHIP_DEF.FLOOR) continue; // 階段が配置できるのは床のみ
        setMapArray(xx, yy, MAP_CHIP_DEF.DOWN.value);
        setDebugArray(xx, yy, "%");
        break;
    }
}

// 宝箱の配置
/**
 * 
 */
function setTreasureBox() {
    let cnt = 6;
    for (; ;) {
        let xx = getRandomInt(MAP_WIDTH);
        let yy = getRandomInt(MAP_HEIGHT);
        let mcd = MAP_CHIP_DEF.getByValue('value', getMapArray(xx, yy));
        if ((mcd !== MAP_CHIP_DEF.FLOOR) && (mcd !== MAP_CHIP_DEF.PATH)) continue; // 階段が配置できるのは床 or 通路

        setMapArray(xx, yy, MAP_CHIP_DEF.T_BOX.value);  // FIXME:後で通路用の
        setDebugArray(xx, yy, "*");
        if (--cnt < 0) {
            break;
        }
    }
}

// 罠の配置
/**
 * 
 */
function setTrap() {
    let kind = -1;
    let cnt = 6;
    for (; ;) {
        if (kind === -1) kind = getRandomInt(6);
        let xx = getRandomInt(MAP_WIDTH);
        let yy = getRandomInt(MAP_HEIGHT);
        let mcd = MAP_CHIP_DEF.getByValue('value', getMapArray(xx, yy));
        if ((mcd !== MAP_CHIP_DEF.FLOOR) && (mcd !== MAP_CHIP_DEF.PATH)) continue; // 階段が配置できるのは床 or 通路
        if ((kind == 0) && (mcd === MAP_CHIP_DEF.PATH)) continue;   // 宝箱型の罠は通路に配置できない
        let mcdTrap;
        if (kind === 0) {
            mcdTrap = MAP_CHIP_DEF.TRAP_T;
        } else {
            if (mcd === MAP_CHIP_DEF.FLOOR) {
                mcdTrap = MAP_CHIP_DEF.TRAP_F;
            } else {
                mcdTrap = MAP_CHIP_DEF.TRAP_P;
            }
        }
        setMapArray(xx, yy, mcdTrap.value);
        setDebugArray(xx, yy, "^");
        if (--cnt < 0) {
            break;
        }
    }
}

// 隠し扉に変換
/**
 * 
 */
function setSecretDoor() {

}

/**
 * 敵の配置
 */
function setEnemy() {
    // 一度mapArrayにも敵を配置する
}

/**
 * プレイヤーの座標設定
 */
function setPlayerMapPos() {
    for (; ;) {
        let xx = getRandomInt(MAP_WIDTH);
        let yy = getRandomInt(MAP_HEIGHT);
        let mcd = MAP_CHIP_DEF.getByValue('value', getMapArray(xx, yy));
        if (mcd !== MAP_CHIP_DEF.FLOOR) continue;// プレイヤーの初期位置は床限定

        player.mapX = xx;
        player.mapY = yy;
        break;
    }
}

/**
 * 
 */
function cleanUpCtrlMapChip() {
    for (let xx = 0; xx < MAP_HEIGHT; xx++) {
        for (let yy = 0; yy < MAP_HEIGHT; yy++) {
            let value = getMapArray(xx, yy);
            if (value == MAP_CHIP_DEF.MONSTER_F.value) {
                setMapArray(xx, yy, MAP_CHIP_DEF.FLOOR.value);
                continue;
            }
            if (value == MAP_CHIP_DEF.MONSTER_P.value) {
                setMapArray(xx, yy, MAP_CHIP_DEF.PATH.value);
                continue;
            }
            if (value == MAP_CHIP_DEF.DIV_LINE.value) {
                setMapArray(xx, yy, MAP_CHIP_DEF.DARK.value);
                continue;
            }
        }
    }
}

function getMapChipDef(xx, yy) {
    return MAP_CHIP_DEF.getByValue('value', getMapArray(xx, yy));
}

function chkMapColi(xx, yy) {
    return getMapChipDef(xx, yy).collision;
}

function chkMapBrightness(xx, yy) {
    return getMapChipDef(xx, yy).brightness;
}

// 0~max（※maxは含まない）
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}