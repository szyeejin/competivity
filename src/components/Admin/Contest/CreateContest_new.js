import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Settings, CheckCircle, ArrowRight, ArrowLeft,
  Sparkles, Trophy, Calendar, Users
} from 'lucide-react';
import Button from '../../UI/Button';
import BasicInfoForm from './BasicInfoForm_new';
import ResourceConfigForm from './ResourceConfigForm';

/**
 * 赛事创建主组件 - 大厂标准升级版
 * 特性：可视化步骤导航、进度条、平滑过渡动画、成功提交动效
 */
const CreateContest = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    resourceConfig: {
      budget: { total: '', categories: [] },
      venue: { autoAssign: false, venues: [] },
      personnel: { organizers: [], judges: [], volunteers: [] },
      equipment: [],
      materials: []
    }
  });

  const [errors, setErrors] = useState({});

  // 步骤配置 - 大厂风格
  const steps = [
    {
      id: 1,
      title: '基础信息',
      subtitle: '配置赛事核心信息',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      title: '资源配置',
      subtitle: '预配置赛事资源',
      icon: Settings,
      color: 'from-purple-500 to-pink-600'
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
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      console.log('提交赛事数据:', contestData);
      // TODO: 调用后端API
      setShowSuccessModal(true);
      
      // 3秒后跳转
      setTimeout(() => {
        // navigate('/admin/contest/list');
      }, 3000);
    } catch (error) {
      console.error('创建赛事失败:', error);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                创建新赛事
              </h1>
              <p className="text-gray-600 mt-1">按照步骤完成赛事的配置，打造精彩竞赛</p>
            </div>
          </div>
        </motion.div>

        {/* 进度条 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* 步骤指示器 */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <React.Fragment key={step.id}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex flex-col items-center flex-1 relative"
                      >
                        {/* 步骤圆圈 */}
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isActive ? 1.1 : 1,
                          }}
                          className="relative"
                        >
                          <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                              isCompleted
                                ? `bg-gradient-to-br ${step.color} shadow-lg`
                                : isActive
                                ? `bg-gradient-to-br ${step.color} shadow-2xl shadow-primary-200`
                                : 'bg-gray-100 border-2 border-gray-300'
                            }`}
                          >
                            {isCompleted ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                              >
                                <CheckCircle className="w-8 h-8 text-white" />
                              </motion.div>
                            ) : (
                              <StepIcon
                                className={`w-7 h-7 ${
                                  isActive ? 'text-white' : 'text-gray-400'
                                }`}
                              />
                            )}
                          </div>
                          
                          {/* 活跃步骤的光环 */}
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
                        </motion.div>

                        {/* 步骤信息 */}
                        <div className="mt-3 text-center">
                          <p
                            className={`font-semibold transition-colors ${
                              isActive || isCompleted
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.title}
                          </p>
                          <p
                            className={`text-xs mt-1 transition-colors ${
                              isActive || isCompleted
                                ? 'text-gray-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.subtitle}
                          </p>
                        </div>
                      </motion.div>

                      {/* 连接线 */}
                      {index < steps.length - 1 && (
                        <div className="flex-1 px-4 relative" style={{ maxWidth: '200px' }}>
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${step.color}`}
                              initial={{ width: '0%' }}
                              animate={{
                                width: currentStep > step.id ? '100%' : '0%',
                              }}
                              transition={{ duration: 0.5, ease: 'easeInOut' }}
                            />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* 总进度条 */}
              <div className="relative">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-lg"
                  initial={{ left: '0%' }}
                  animate={{ left: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ marginLeft: '-8px' }}
                />
              </div>
              
              <div className="mt-2 text-center">
                <span className="text-sm font-medium text-gray-600">
                  进度: {Math.round(progress)}% 完成
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 表单内容区 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6"
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
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex items-center justify-between sticky bottom-6 z-10"
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
            <span className="font-semibold text-gray-900">第 {currentStep}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{steps.length} 步</span>
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
              icon={<Sparkles className="w-4 h-4" />}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              提交创建
            </Button>
          )}
        </motion.div>
      </div>

      {/* 成功提交动效弹窗 */}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  赛事创建成功！
                </h2>
                <p className="text-gray-600">
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
