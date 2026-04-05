-- Courses
INSERT INTO courses (id, phase, title, subtitle, sort_order) VALUES
  (1, 0, '高校数学からCSへの橋渡し', 'CS離散数学に必要な高校数学の速習', 1),
  (2, 1, '計算機科学の数学', 'MIT 6.042J 相当', 2),
  (3, 1, 'アルゴリズムとデータ構造', 'MIT 6.006 + 6.046J 相当', 3),
  (4, 2, '計算機アーキテクチャ', 'MIT 6.004 相当', 4),
  (5, 2, 'オペレーティングシステム', 'MIT 6.033 + 6.1810 相当', 5),
  (6, 3, 'コンピュータネットワーク', 'MIT 6.033 + 6.829 相当', 6),
  (7, 3, '分散システム', 'MIT 6.824 相当', 7),
  (8, 4, 'データベース理論と設計', 'MIT 6.830 相当', 8),
  (9, 4, '計算理論', 'MIT 6.045J 相当', 9);

-- Course 0: 高校数学からCSへの橋渡し (3 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (1, 1, 1, '論理と集合（基礎言語）', '命題, 論理演算, 集合, ∀と∃, ド・モルガンの法則', 0),
  (2, 1, 2, '数と式の道具箱', '指数法則, 対数, Σ記法, 等差・等比数列の和', 0),
  (3, 1, 3, '数え上げの基礎 + セルフチェック', '積の法則, 和の法則, 順列, 組合せ, 階乗, 二項係数', 1);

-- Course 1: 計算機科学の数学 (6 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (4, 2, 1, '証明の技法', '直接証明, 背理法, 数学的帰納法, 構造的帰納法', 0),
  (5, 2, 2, 'グラフ理論の基礎', '有向/無向グラフ, DAG, 木, オイラー路, 彩色', 0),
  (6, 2, 3, '数え上げと組合せ', '順列・組合せ, 二項係数, 包除原理, 鳩ノ巣原理', 0),
  (7, 2, 4, '離散確率', '確率空間, 条件付き確率, ベイズの定理, 期待値', 0),
  (8, 2, 5, '漸化式と母関数', '漸化式の解法, マスター定理, 母関数入門', 0),
  (9, 2, 6, '総合テスト', '全範囲の理解度確認', 1);

-- Course 2: アルゴリズムとデータ構造 (6 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (10, 3, 1, '計算量の理論', 'O/Ω/Θ記法, 償却解析, 最悪/平均/期待計算量', 0),
  (11, 3, 2, '探索とソート', '比較ソートの下界, 基数ソート, 選択アルゴリズム', 0),
  (12, 3, 3, '木とハッシュ', '平衡二分探索木, ハッシュ設計, 一様ハッシュ仮定', 0),
  (13, 3, 4, 'グラフアルゴリズム', 'BFS/DFS, 最短経路, 最小全域木', 0),
  (14, 3, 5, '動的計画法と貪欲法', '部分問題の構造, 最適部分構造, DP設計パターン', 0),
  (15, 3, 6, '総合テスト + 実装課題', '全範囲 + LeetCode Medium相当', 1);

-- Course 3: 計算機アーキテクチャ (5 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (16, 4, 1, 'デジタル論理と抽象化', 'ブール代数, 組合せ回路, 順序回路, FSM', 0),
  (17, 4, 2, 'プロセッサ設計', '命令セット(RISC-V), データパス, パイプライン', 0),
  (18, 4, 3, 'メモリ階層', 'キャッシュ(L1/L2/L3), 仮想記憶, TLB, ページテーブル', 0),
  (19, 4, 4, '並列性', 'マルチコア, キャッシュコヒーレンス, メモリモデル, SIMD', 0),
  (20, 4, 5, '総合テスト', '全範囲', 1);

-- Course 4: オペレーティングシステム (7 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (21, 5, 1, 'プロセスとスレッド', 'fork/exec, コンテキストスイッチ, スケジューリング(CFS)', 0),
  (22, 5, 2, 'メモリ管理', 'ページング, セグメンテーション, malloc実装, OOM Killer', 0),
  (23, 5, 3, '同期と並行性', 'mutex, セマフォ, デッドロック, lock-freeデータ構造', 0),
  (24, 5, 4, 'ファイルシステム', 'inode, ジャーナリング, VFS, ext4 vs btrfs', 0),
  (25, 5, 5, '仮想化とコンテナ', 'ハイパーバイザ, namespace, cgroups, Dockerの内部実装', 0),
  (26, 5, 6, 'セキュリティ', '権限モデル, capability, seccomp, AppArmor/SELinux', 0),
  (27, 5, 7, '総合テスト + 実験課題', '全範囲 + straceでシステムコールを追跡', 1);

-- Course 5: コンピュータネットワーク (5 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (28, 6, 1, 'レイヤモデルとプロトコル', 'OSI/TCP/IP, カプセル化, end-to-end argument', 0),
  (29, 6, 2, 'トランスポート層', 'TCP, UDP, QUIC, 輻輳制御, フロー制御', 0),
  (30, 6, 3, 'ルーティングとDNS', 'BGP, OSPF, Anycast, DNS再帰/反復, DNSSEC', 0),
  (31, 6, 4, 'アプリケーション層とCDN', 'HTTP/2, HTTP/3, TLS 1.3, CDNアーキテクチャ', 0),
  (32, 6, 5, '総合テスト', '全範囲', 1);

-- Course 6: 分散システム (7 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (33, 7, 1, '分散システムの基礎', 'CAP定理, FLP不可能性, 障害モデル', 0),
  (34, 7, 2, '時間と順序', 'Lamport時計, ベクタークロック, 因果一貫性', 0),
  (35, 7, 3, '合意プロトコル', 'Paxos, Raft, リーダー選出, 安全性証明', 0),
  (36, 7, 4, 'レプリケーション', '主従/マルチリーダー/リーダーレス, CRDT, 最終的一貫性', 0),
  (37, 7, 5, '分散トランザクション', '2PC, 3PC, Saga, TCC, 結果整合性パターン', 0),
  (38, 7, 6, '大規模システム設計', 'MapReduce, GFS/HDFS, Spanner, Dynamo', 0),
  (39, 7, 7, '総合テスト + 設計課題', '全範囲 + 設計問題', 1);

-- Course 7: データベース理論と設計 (5 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (40, 8, 1, '関係モデルと関係代数', '関係代数, SQL意味論, 正規化(BCNF/4NF)', 0),
  (41, 8, 2, 'ストレージとインデックス', 'B+木, LSM木, カラムナーストレージ, ブルームフィルタ', 0),
  (42, 8, 3, 'クエリ処理と最適化', '実行計画, コストモデル, 結合アルゴリズム', 0),
  (43, 8, 4, 'トランザクションと並行制御', 'ACID, MVCC, 2PL, SSI, WAL', 0),
  (44, 8, 5, '総合テスト + EXPLAIN課題', '全範囲 + EXPLAIN最適化', 1);

-- Course 8: 計算理論 (5 weeks)
INSERT INTO weeks (id, course_id, week_number, title, keywords, is_test) VALUES
  (45, 9, 1, 'オートマトンと正規言語', 'DFA/NFA, 正規表現との等価性, ポンプの補題', 0),
  (46, 9, 2, '文脈自由言語', 'CFG, PDA, CYK, チョムスキー階層', 0),
  (47, 9, 3, '計算可能性', 'チューリングマシン, 停止問題, 帰着, 決定不能性', 0),
  (48, 9, 4, '計算量クラス', 'P, NP, NP完全, 多項式時間帰着, Cook-Levinの定理', 0),
  (49, 9, 5, '総合テスト', '全範囲', 1);
