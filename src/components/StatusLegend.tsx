import React from 'react';

export function StatusLegend() {
  return (
    <div className="bg-white rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 hover:-translate-y-1">
      <div className="p-4 sm:p-6">
        <h4 className="text-gray-900 mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Статусы надежности клиентов</h4>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-2xl sm:text-3xl">💗</span>
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm sm:text-base">Надежный клиент</p>
              <p className="text-gray-600 text-sm hidden sm:block">Нет просрочек по платежам</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-2xl sm:text-3xl">💔</span>
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm sm:text-base">Ненадежный клиент</p>
              <p className="text-gray-600 text-sm hidden sm:block">Есть история просрочек</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}