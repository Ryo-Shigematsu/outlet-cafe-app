'use client'

type CafeDashboardProps = {
  cafeCount: number
  onOpenRegistration: () => void
  onOpenList: () => void
}

export function CafeDashboard({
  cafeCount,
  onOpenRegistration,
  onOpenList,
}: CafeDashboardProps) {
  return (
    <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md z-10 flex flex-col gap-3 w-64">
      <div>
        <h1 className="font-bold text-lg text-gray-800">電源・Wi-Fiカフェ検索</h1>
        <p className="text-sm text-gray-600">登録店舗数: {cafeCount}件</p>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={onOpenRegistration}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-md transition shadow-sm text-center"
        >
          ＋ 現在地にカフェを登録
        </button>
        <button
          onClick={onOpenList}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold py-2 px-3 rounded-md transition border border-gray-300 text-center"
        >
          📋 登録カフェ一覧を見る
        </button>
      </div>
    </div>
  )
}
