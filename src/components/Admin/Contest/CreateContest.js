import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Settings, CheckCircle2, Loader2, Award, Sparkles } from 'lucide-react';
import BasicInfoForm from './BasicInfoForm';
import ResourceConfigForm from './ResourceConfigForm';

/**
 * 赛事创建主组件
 * 分为两个主要步骤：1.基础信息配置  2.资源预配置管理
 */
const CreateContest = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [contestData, setContestData] = useState({
    // 基础信息
    basicInfo: {
      name: '',
      type: '',
      timeAndPlace: {
        startDate: '',
        endDate: '',
        registrationStart: '',
        registrationEnd: '',
        location: '',
        onlineMode: false
      },
      incentives: {
        firstPrize: '',
        secondPrize: '',
        thirdPrize: '',
        certificate: false,
        scholarship: ''
      },
      milestones: [],
      participantScope: {
        schoolTypes: [],
        grades: [],
        maxTeamSize: 1,
        minTeamSize: 1
      },
      registrationRules: {
        requireResume: false,
        requirePortfolio: false,
        customFields: []
      },
      rules: ''
    },
    // 资源配置
    resourceConfig: {
      budget: {
        total: '',
        categories: []
      },
      venue: {
        autoAssign: false,
        venues: []
      },
      personnel: {
        organizers: [],
        judges: [],
        volunteers: []
      },
      equipment: [],
      materials: []
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 步骤配置
  const steps = [
    { 
      id: 1, 
      title: '基础信息配置', 
      shortTitle: '基础信息',
      icon: <Trophy className="w-5 h-5" />,
      description: '设置赛事基本信息、时间、地点和规则'
    },
    { 
      id: 2, 
      title: '资源预配置管理', 
      shortTitle: '资源配置',
      icon: <Settings className="w-5 h-5" />,
      description: '配置赛事预算、场地、人员和物资'
    }
  ];

  // 更新赛事数据
  const updateContestData = (section, data) => {
    setContestData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

  // 下一步
  const handleNext = () => {
    // 验证当前步骤
    if (currentStep === 1) {
      const validationErrors = validateBasicInfo();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
    setErrors({});
  };

  // 上一步
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  // 验证基础信息
  const validateBasicInfo = () => {
    const errors = {};
    const { basicInfo } = contestData;

    if (!basicInfo.name) {
      errors.name = '请输入赛事名称';
    }
    if (!basicInfo.type) {
      errors.type = '请选择赛事类型';
    }
    if (!basicInfo.timeAndPlace.startDate) {
      errors.startDate = '请选择开始时间';
    }
    if (!basicInfo.timeAndPlace.endDate) {
      errors.endDate = '请选择结束时间';
    }
    if (!basicInfo.timeAndPlace.location && !basicInfo.timeAndPlace.onlineMode) {
      errors.location = '请输入赛事地点或选择线上模式';
    }

    return errors;
  };

  // 提交赛事创建
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('提交赛事数据:', contestData);
      // TODO: 调用后端API创建赛事
      await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟API请求
      setShowSuccessModal(true);
      
      // 2秒后自动关闭并跳转
      setTimeout(() => {
        setShowSuccessModal(false);
        // 跳转到赛事列表或详情页
      }, 2000);
    } catch (error) {
      console.error('创建赛事失败:', error);
      alert('创建失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-gradient">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              创建新赛事
            </h1>
            <p className="text-neutral-600 mt-1 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-500" />
              按照步骤完成赛事的基础信息和资源配置
            </p>
          </div>
        </div>
      </motion.div>

      {/* 顶部胶囊型进度条+步骤标签页 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-card border border-neutral-200 overflow-hidden"
      >
        {/* 步骤标签页 */}
        <div className="flex items-stretch border-b border-neutral-200">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isPending = currentStep < step.id;
            
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (!isPending || isCompleted) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={isPending && !isCompleted}
                className={`flex-1 relative px-6 py-5 transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-primary-50 to-primary-100/50' 
                    : isPending 
                    ? 'bg-neutral-50 cursor-not-allowed' 
                    : 'hover:bg-neutral-50 cursor-pointer'
                }`}
              >
                {/* 顶部进度条 */}
                <div className="absolute top-0 left-0 right-0 h-1">
                  {isActive && (
                    <motion.div
                      layoutId="activeStepIndicator"
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-700 animate-pulse-gradient"
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  )}
                  {isCompleted && (
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600" />
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* 图标 */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md scale-105'
                      : isActive
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-gradient scale-105'
                      : 'bg-neutral-200 text-neutral-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>

                  {/* 文字信息 */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium uppercase tracking-wide ${
                        isActive 
                          ? 'text-primary-700' 
                          : isPending 
                          ? 'text-neutral-400' 
                          : 'text-neutral-600'
                      }`}>
                        步骤 {step.id}
                      </span>
                      {isPending && !isCompleted && (
                        <span className="px-2 py-0.5 bg-neutral-200 text-neutral-500 text-xs rounded-full">
                          待完成
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          已完成
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-semibold mb-1 transition-colors ${
                      isActive 
                        ? 'text-primary-700' 
                        : isPending 
                        ? 'text-neutral-400' 
                        : 'text-neutral-800'
                    }`}>
                      {step.shortTitle}
                    </h3>
                    <p className={`text-xs leading-relaxed ${
                      isActive 
                        ? 'text-primary-600/80' 
                        : isPending 
                        ? 'text-neutral-400' 
                        : 'text-neutral-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 整体进度条 */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-600">整体进度</span>
            <span className="text-xs font-semibold text-primary-700">
              {Math.round((currentStep / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-pill overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-600 to-primary-700 rounded-pill"
            />
          </div>
        </div>
      </motion.div>

      {/* 表单内容区 - 带滑动+淡入动画 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white rounded-2xl shadow-card border border-neutral-200 overflow-hidden hover:shadow-card-hover transition-shadow duration-300"
        >
          {currentStep === 1 && (
            <BasicInfoForm
              data={contestData.basicInfo}
              errors={errors}
              onChange={(data) => updateContestData('basicInfo', data)}
            />
          )}
          {currentStep === 2 && (
            <ResourceConfigForm
              data={contestData.resourceConfig}
              errors={errors}
              onChange={(data) => updateContestData('resourceConfig', data)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 底部操作按钮 - 固定在底部 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="sticky bottom-4 z-10 bg-white rounded-2xl shadow-xl p-6 border border-neutral-200 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          {/* 上一步按钮 */}
          <motion.button
            whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
            whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              currentStep === 1
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-2 border-transparent hover:border-neutral-300'
            }`}
          >
            上一步
          </motion.button>

          {/* 进度指示 */}
          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`h-2 rounded-pill transition-all duration-300 ${
                  currentStep === step.id
                    ? 'w-12 bg-gradient-to-r from-primary-600 to-primary-700'
                    : currentStep > step.id
                    ? 'w-8 bg-green-500'
                    : 'w-8 bg-neutral-300'
                }`}
              />
            ))}
          </div>

          {/* 下一步/提交按钮 */}
          {currentStep < steps.length ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="group relative px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-sm shadow-gradient overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              {/* Hover渐变反向效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">下一步 →</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group relative px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-sm shadow-gradient overflow-hidden transition-all duration-300 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {/* Hover渐变反向效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    提交创建
                  </>
                )}
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* 成功提交动画弹窗 */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
            >
              {/* 对勾动画 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-gradient"
              >
                <CheckCircle2 className="w-14 h-14 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-neutral-900 mb-3"
              >
                创建成功！
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-neutral-600"
              >
                赛事已成功创建，即将跳转到赛事列表
              </motion.p>
              
              {/* 加载动画 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex items-center justify-center gap-1"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="w-2 h-2 bg-primary-600 rounded-full"
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateContest;
