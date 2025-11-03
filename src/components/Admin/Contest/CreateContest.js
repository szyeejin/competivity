import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Settings, CheckCircle, ArrowRight, ArrowLeft,
  Sparkles, Award
} from 'lucide-react';
import Button from '../../UI/Button';
import BasicInfoForm from './BasicInfoForm';
import ResourceConfigForm from './ResourceConfigForm';

/**
 * 赛事创建主组件 - 大厂顶级标准
 * 特性：胶囊型进度条、动态脉冲效果、步骤标签页、滑动+淡入动画、成功弹窗
 */
const CreateContest = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(1); // 1为向前，-1为向后
  
  const [contestData, setContestData] = useState({
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
      rules: ''
    },
    resourceConfig: {
      budget: { total: '', categories: [] },
      venue: { autoAssign: false, venues: [] },
      personnel: { organizers: [], judges: [], volunteers: [] },
      equipment: [],
      materials: []
    }
  });

  const [errors, setErrors] = useState({});

  // 步骤配置
  const steps = [
    {
      id: 1,
      title: '基础信息配置',
      shortTitle: '基础信息',
      icon: Trophy,
      description: '设置赛事核心信息',
      color: 'from-primary-600 to-purple-700'
    },
    {
      id: 2,
      title: '资源预配置管理',
      shortTitle: '资源配置',
      icon: Settings,
      description: '预配置赛事资源',
      color: 'from-purple-600 to-pink-600'
    }
  ];

  const updateContestData = (section, data) => {
    setContestData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const validateBasicInfo = () => {
    const errors = {};
    const { basicInfo } = contestData;

    if (!basicInfo.name) errors.name = '请输入赛事名称';
    if (!basicInfo.type) errors.type = '请选择赛事类型';
    if (!basicInfo.timeAndPlace.startDate) errors.startDate = '请选择开始时间';
    if (!basicInfo.timeAndPlace.endDate) errors.endDate = '请选择结束时间';
    if (!basicInfo.timeAndPlace.location && !basicInfo.timeAndPlace.onlineMode) {
      errors.location = '请输入赛事地点或选择线上模式';
    }

    return errors;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const validationErrors = validateBasicInfo();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }
    setAnimationDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
    setErrors({});
    // 延迟滚动，等待动画开始
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handlePrevious = () => {
    setAnimationDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('提交赛事数据:', contestData);
      
      // 调用后端API创建赛事
      const response = await fetch('http://localhost:3001/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contestData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 赛事创建成功, ID:', result.contestId);
        setShowSuccessModal(true);
        
        // 2秒后自动收起
        setTimeout(() => {
          setShowSuccessModal(false);
          // 可选：跳转到赛事列表页
          // navigate('/admin/contest/list');
        }, 2000);
      } else {
        throw new Error(result.message || '创建失败');
      }
    } catch (error) {
      console.error('❌ 创建赛事失败:', error);
      alert('创建赛事失败: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-700 bg-clip-text text-transparent">
                创建新赛事
              </h1>
              <p className="text-neutral-600 mt-1">按照步骤完成赛事的配置，打造精彩竞赛</p>
            </div>
          </div>
        </motion.div>

        {/* 顶部横向进度条+步骤标签页（胶囊型） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* 步骤标签页 */}
            <div className="flex items-stretch">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isPending = currentStep < step.id;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (!isPending || isCompleted) {
                        setAnimationDirection(step.id > currentStep ? 1 : -1);
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={isPending && !isCompleted}
                    className={`flex-1 relative px-6 py-5 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-primary-50 to-purple-50' 
                        : isPending 
                        ? 'bg-neutral-50 cursor-not-allowed opacity-60' 
                        : 'hover:bg-neutral-50 cursor-pointer'
                    }`}
                  >
                    {/* 顶部进度条（带脉冲） */}
                    <div className="absolute top-0 left-0 right-0 h-1">
                      {isActive && (
                        <>
                          <motion.div
                            className={`h-full bg-gradient-to-r ${step.color}`}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          {/* 动态脉冲效果 */}
                          <motion.div
                            className={`absolute top-0 left-0 right-0 h-full bg-gradient-to-r ${step.color}`}
                            animate={{
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        </>
                      )}
                      {isCompleted && (
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600" />
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* 图标（胶囊型背景） */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
                          : isActive
                          ? `bg-gradient-to-br ${step.color} text-white shadow-xl`
                          : 'bg-neutral-200 text-neutral-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                        
                        {/* 动态光环效果 */}
                        {isActive && (
                          <motion.div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-20`}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.2, 0, 0.2],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
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
                            <span className="px-2 py-0.5 bg-neutral-200 text-neutral-500 text-xs rounded-pill">
                              待完成
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-pill font-medium">
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

            {/* 整体进度条（胶囊型） */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600">整体进度</span>
                <span className="text-xs font-semibold text-primary-700">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="relative w-full h-2 bg-neutral-200 rounded-pill overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-pill"
                />
                {/* 进度点 */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-600 rounded-full shadow-lg"
                  initial={{ left: '0%' }}
                  animate={{ left: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ marginLeft: '-8px' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 表单内容区 - 滑动+淡入动画 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: animationDirection * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: animationDirection * -50 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 mb-6 hover:shadow-xl transition-shadow duration-300"
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

        {/* 底部操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200 flex items-center justify-between sticky bottom-6 z-10"
        >
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            icon={<ArrowLeft className="w-4 h-4" />}
            size="lg"
          >
            上一步
          </Button>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-neutral-900">第 {currentStep}</span>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-600">{steps.length} 步</span>
          </div>

          {currentStep < steps.length ? (
            <Button
              variant="primary"
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              size="lg"
            >
              下一步
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              icon={!isSubmitting && <Sparkles className="w-4 h-4" />}
              size="lg"
              className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700"
            >
              {isSubmitting ? '提交中...' : '提交创建'}
            </Button>
          )}
        </motion.div>
      </div>

      {/* 成功提交弹窗 - 带主色动效的对勾弹窗 */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-50"
            >
              {/* 成功图标动画 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  赛事创建成功！
                </h2>
                <p className="text-neutral-600">
                  您的赛事已经成功创建，即将跳转到赛事列表...
                </p>
              </motion.div>

              {/* 庆祝动画 */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
                    initial={{
                      x: '50%',
                      y: '30%',
                      scale: 0,
                    }}
                    animate={{
                      x: `${50 + Math.cos((i / 12) * Math.PI * 2) * 200}%`,
                      y: `${30 + Math.sin((i / 12) * Math.PI * 2) * 200}%`,
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.6 + i * 0.05,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateContest;
