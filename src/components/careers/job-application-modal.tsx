"use client";

import { useActionState, useRef, useState } from "react";
import {
  submitJobApplication,
  type JobApplicationState,
} from "@/app/job-application-actions";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { JalaliDateField } from "@/components/ui/jalali-date-field";
import { ModalShell } from "@/components/ui/modal-shell";
import { useToast } from "@/components/ui/toast-provider";
import {
  emptyCompetency,
  emptyDependent,
  emptyEducation,
  emptyForeignLanguage,
  emptyReferee,
  emptyTrainingCourse,
  emptyWorkExperience,
  genderOptions,
  healthStatusOptions,
  languageSkillFields,
  maritalStatusOptions,
  militaryStatusOptions,
  referralSourceOptions,
  skillLevelOptions,
  specialtyOptions,
  traitOptions,
  type CompetencyRow,
  type DependentRow,
  type EducationRow,
  type ForeignLanguageRow,
  type RefereeRow,
  type TrainingCourseRow,
  type WorkExperienceRow,
} from "@/lib/job-application";

const initialState: JobApplicationState = {};
const fieldClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";
const labelClassName = "grid gap-2 text-sm font-black text-slate-950";
const chipClassName =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/70 has-checked:border-teal-400 has-checked:bg-teal-50 has-checked:text-teal-700";

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <div className="mt-8 border-t border-slate-100 pt-6 first:mt-0 first:border-0 first:pt-0">
      <p className="text-xs font-extrabold tracking-wide text-teal-500">
        {children}
      </p>
      {hint ? (
        <p className="mt-1 text-xs font-medium leading-6 text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function ChoiceGroup({
  label,
  name,
  onChange,
  options,
  required = false,
  value,
}: {
  label: string;
  name: string;
  onChange?: (value: string) => void;
  options: ReadonlyArray<{ id: string; label: string }>;
  required?: boolean;
  value?: string;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="pb-2 text-sm font-black text-slate-950">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label className={chipClassName} key={option.id}>
            <input
              checked={value === undefined ? undefined : value === option.id}
              className="size-4 accent-teal-500"
              name={name}
              onChange={() => onChange?.(option.id)}
              required={required}
              type="radio"
              value={option.id}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function YesNoGroup({
  label,
  name,
  onChange,
  value,
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <ChoiceGroup
      label={label}
      name={name}
      onChange={onChange}
      options={[
        { id: "YES", label: "بله" },
        { id: "NO", label: "خیر" },
      ]}
      value={value}
    />
  );
}

type ColumnDefinition<Row> = {
  id: keyof Row & string;
  label: string;
  options?: ReadonlyArray<{ id: string; label: string }>;
};

function RepeatableSection<Row extends Record<string, string>>({
  addLabel,
  columns,
  emptyRow,
  maxRows = 8,
  onChange,
  rows,
}: {
  addLabel: string;
  columns: Array<ColumnDefinition<Row>>;
  emptyRow: Row;
  maxRows?: number;
  onChange: (rows: Row[]) => void;
  rows: Row[];
}) {
  function updateCell(index: number, key: keyof Row & string, value: string) {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {rows.map((row, index) => (
        <div
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4"
          key={index}
        >
          <div className="flex items-center justify-between gap-3 pb-3">
            <span className="text-xs font-extrabold text-slate-500">
              ردیف {(index + 1).toLocaleString("fa-IR")}
            </span>
            {rows.length > 1 ? (
              <button
                className="min-h-9 rounded-lg px-2.5 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50"
                onClick={() =>
                  onChange(rows.filter((_, rowIndex) => rowIndex !== index))
                }
                type="button"
              >
                حذف ردیف
              </button>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column) => (
              <label
                className="grid gap-1.5 text-xs font-extrabold text-slate-600"
                key={column.id}
              >
                {column.label}
                {column.options ? (
                  <select
                    className={fieldClassName}
                    onChange={(event) =>
                      updateCell(index, column.id, event.target.value)
                    }
                    value={row[column.id]}
                  >
                    <option value="">—</option>
                    {column.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={fieldClassName}
                    maxLength={160}
                    onChange={(event) =>
                      updateCell(index, column.id, event.target.value)
                    }
                    value={row[column.id]}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      {rows.length < maxRows ? (
        <button
          className="min-h-11 rounded-xl border border-dashed border-teal-300 bg-teal-50/60 px-4 text-sm font-extrabold text-teal-600 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          onClick={() => onChange([...rows, { ...emptyRow }])}
          type="button"
        >
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}

export function JobApplicationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [militaryStatus, setMilitaryStatus] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [isCurrentlyEmployed, setIsCurrentlyEmployed] = useState("");
  const [plansFurtherStudy, setPlansFurtherStudy] = useState("");
  const [plansEmigration, setPlansEmigration] = useState("");
  const [canProvideConsent, setCanProvideConsent] = useState("");
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [dependents, setDependents] = useState<DependentRow[]>([
    { ...emptyDependent },
  ]);
  const [referees, setReferees] = useState<RefereeRow[]>([
    { ...emptyReferee },
    { ...emptyReferee },
  ]);
  const [educations, setEducations] = useState<EducationRow[]>([
    { ...emptyEducation },
  ]);
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceRow[]>([
    { ...emptyWorkExperience },
  ]);
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourseRow[]>([
    { ...emptyTrainingCourse },
  ]);
  const [competencies, setCompetencies] = useState<CompetencyRow[]>([
    { ...emptyCompetency },
  ]);
  const [foreignLanguages, setForeignLanguages] = useState<ForeignLanguageRow[]>(
    [{ ...emptyForeignLanguage }],
  );

  const [, formAction, isPending] = useActionState(
    async (previousState: JobApplicationState, formData: FormData) => {
      const result = await submitJobApplication(previousState, formData);

      if (result.messageKey) {
        toast(t(result.messageKey), {
          variant: result.success ? "success" : "error",
        });
      }

      if (result.success) {
        formRef.current?.reset();
        setBirthDate("");
        setGender("");
        setMaritalStatus("");
        setMilitaryStatus("");
        setHealthStatus("");
        setReferralSource("");
        setIsCurrentlyEmployed("");
        setPlansFurtherStudy("");
        setPlansEmigration("");
        setCanProvideConsent("");
        setResumeName(null);
        setDependents([{ ...emptyDependent }]);
        setReferees([{ ...emptyReferee }, { ...emptyReferee }]);
        setEducations([{ ...emptyEducation }]);
        setWorkExperiences([{ ...emptyWorkExperience }]);
        setTrainingCourses([{ ...emptyTrainingCourse }]);
        setCompetencies([{ ...emptyCompetency }]);
        setForeignLanguages([{ ...emptyForeignLanguage }]);
        onClose();
      }

      return result;
    },
    initialState,
  );

  return (
    <ModalShell
      closeLabel={t("careers.close")}
      description={t("careers.description")}
      dir="rtl"
      eyebrow={t("careers.eyebrow")}
      id="job-application-dialog"
      initialFocusSelector='input[name="firstName"]'
      isOpen={isOpen}
      maxWidthClassName="max-w-4xl"
      onClose={onClose}
      title={t("careers.title")}
    >
      <form
        action={formAction}
        className="overflow-y-auto overscroll-contain px-5 py-5 text-right sm:px-7 sm:py-6"
        ref={formRef}
      >
        <input name="dependentsJson" type="hidden" value={JSON.stringify(dependents)} />
        <input name="refereesJson" type="hidden" value={JSON.stringify(referees)} />
        <input name="educationsJson" type="hidden" value={JSON.stringify(educations)} />
        <input name="workExperiencesJson" type="hidden" value={JSON.stringify(workExperiences)} />
        <input name="trainingCoursesJson" type="hidden" value={JSON.stringify(trainingCourses)} />
        <input name="competenciesJson" type="hidden" value={JSON.stringify(competencies)} />
        <input name="foreignLanguagesJson" type="hidden" value={JSON.stringify(foreignLanguages)} />

        <SectionTitle>مشخصات فردی</SectionTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className={labelClassName}>
            نام
            <input className={fieldClassName} maxLength={80} name="firstName" required />
          </label>
          <label className={labelClassName}>
            نام خانوادگی
            <input className={fieldClassName} maxLength={80} name="lastName" required />
          </label>
          <label className={labelClassName}>
            نام پدر
            <input className={fieldClassName} maxLength={80} name="fatherName" />
          </label>
          <label className={labelClassName}>
            شماره شناسنامه
            <input className={fieldClassName} dir="ltr" inputMode="numeric" maxLength={20} name="identityNumber" />
          </label>
          <label className={labelClassName}>
            کد ملی
            <input
              className={`${fieldClassName} font-mono tracking-[0.12em]`}
              dir="ltr"
              inputMode="numeric"
              maxLength={10}
              name="nationalCode"
              required
            />
          </label>
          <label className={labelClassName}>
            ملیت
            <input className={fieldClassName} maxLength={60} name="nationality" />
          </label>
          <label className={labelClassName}>
            محل تولد
            <input className={fieldClassName} maxLength={100} name="birthPlace" />
          </label>
          <label className={labelClassName}>
            محل صدور
            <input className={fieldClassName} maxLength={100} name="issuePlace" />
          </label>
          <div className={labelClassName}>
            تاریخ تولد
            <JalaliDateField
              dayLabel="روز"
              fieldClassName={fieldClassName}
              monthLabel="ماه"
              name="birthDate"
              onChange={setBirthDate}
              required
              value={birthDate}
              yearLabel="سال"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <ChoiceGroup
            label="جنسیت"
            name="gender"
            onChange={setGender}
            options={genderOptions}
            required
            value={gender}
          />
          <ChoiceGroup
            label="وضعیت تأهل"
            name="maritalStatus"
            onChange={setMaritalStatus}
            options={maritalStatusOptions}
            required
            value={maritalStatus}
          />
          <ChoiceGroup
            label="وضعیت نظام وظیفه"
            name="militaryStatus"
            onChange={setMilitaryStatus}
            options={militaryStatusOptions}
            value={militaryStatus}
          />
          <ChoiceGroup
            label="وضعیت جسمانی"
            name="healthStatus"
            onChange={setHealthStatus}
            options={healthStatusOptions}
            value={healthStatus}
          />
          {militaryStatus === "EXEMPT" ? (
            <label className={labelClassName}>
              نوع معافیت
              <input className={fieldClassName} maxLength={120} name="exemptionType" />
            </label>
          ) : null}
          {healthStatus === "ISSUE" ? (
            <label className={labelClassName}>
              شرح مشکل جسمانی
              <input className={fieldClassName} maxLength={200} name="healthNote" />
            </label>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className={labelClassName}>
            پست الکترونیکی
            <input className={fieldClassName} dir="ltr" maxLength={254} name="email" type="email" />
          </label>
          <label className={labelClassName}>
            تلفن همراه
            <input
              className={`${fieldClassName} font-mono tracking-[0.12em]`}
              dir="ltr"
              inputMode="tel"
              maxLength={11}
              name="mobile"
              placeholder="09xxxxxxxxx"
              required
            />
          </label>
          <label className={labelClassName}>
            تلفن منزل
            <input className={fieldClassName} dir="ltr" inputMode="tel" maxLength={20} name="homePhone" />
          </label>
          <label className={labelClassName}>
            شماره تماس ضروری
            <input className={fieldClassName} dir="ltr" inputMode="tel" maxLength={20} name="emergencyPhone" />
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            آدرس محل سکونت
            <input className={fieldClassName} maxLength={500} name="address" />
          </label>
        </div>

        {maritalStatus === "MARRIED" ? (
          <>
            <SectionTitle>اطلاعات همسر</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className={labelClassName}>
                نام و نام خانوادگی
                <input className={fieldClassName} maxLength={120} name="spouseName" />
              </label>
              <label className={labelClassName}>
                شغل
                <input className={fieldClassName} maxLength={120} name="spouseJob" />
              </label>
              <label className={labelClassName}>
                تلفن
                <input className={fieldClassName} dir="ltr" inputMode="tel" maxLength={20} name="spousePhone" />
              </label>
              <label className={labelClassName}>
                تعداد پسر
                <input className={fieldClassName} dir="ltr" inputMode="numeric" max={30} min={0} name="sonsCount" type="number" />
              </label>
              <label className={labelClassName}>
                تعداد دختر
                <input className={fieldClassName} dir="ltr" inputMode="numeric" max={30} min={0} name="daughtersCount" type="number" />
              </label>
            </div>
          </>
        ) : null}

        <SectionTitle hint="افراد تحت تکفل خود را وارد کنید.">
          اطلاعات خانواده و افراد تحت تکفل
        </SectionTitle>
        <RepeatableSection
          addLabel="افزودن فرد"
          columns={[
            { id: "name", label: "نام و نام خانوادگی" },
            { id: "relation", label: "نسبت" },
            { id: "age", label: "سن" },
            { id: "job", label: "شغل" },
            { id: "phone", label: "شماره تماس" },
          ]}
          emptyRow={emptyDependent}
          onChange={setDependents}
          rows={dependents}
        />

        <SectionTitle hint="دو نفر غیر از بستگان درجه اول که شما را کاملاً بشناسند.">
          اطلاعات معرف
        </SectionTitle>
        <RepeatableSection
          addLabel="افزودن معرف"
          columns={[
            { id: "name", label: "نام و نام خانوادگی" },
            { id: "relation", label: "نسبت" },
            { id: "job", label: "شغل" },
            { id: "organization", label: "سازمان" },
            { id: "phone", label: "شماره تماس" },
          ]}
          emptyRow={emptyReferee}
          maxRows={4}
          onChange={setReferees}
          rows={referees}
        />

        <SectionTitle>اطلاعات تحصیلی</SectionTitle>
        <RepeatableSection
          addLabel="افزودن مقطع"
          columns={[
            { id: "degree", label: "مقطع تحصیلی" },
            { id: "field", label: "رشته تحصیلی" },
            { id: "orientation", label: "گرایش" },
            { id: "university", label: "نام دانشگاه" },
            { id: "gpa", label: "معدل" },
            { id: "graduationYear", label: "سال اخذ مدرک" },
          ]}
          emptyRow={emptyEducation}
          onChange={setEducations}
          rows={educations}
        />

        <SectionTitle hint="به ترتیب آخرین سابقه وارد کنید.">سوابق کاری</SectionTitle>
        <RepeatableSection
          addLabel="افزودن سابقه"
          columns={[
            { id: "organization", label: "نام سازمان" },
            { id: "position", label: "پست سازمانی" },
            { id: "phone", label: "تلفن سازمان" },
            { id: "startDate", label: "تاریخ شروع" },
            { id: "endDate", label: "تاریخ پایان" },
            { id: "leaveReason", label: "علت خاتمه همکاری" },
            { id: "salary", label: "حقوق و مزایا" },
          ]}
          emptyRow={emptyWorkExperience}
          onChange={setWorkExperiences}
          rows={workExperiences}
        />

        <SectionTitle>دوره‌های آموزشی</SectionTitle>
        <RepeatableSection
          addLabel="افزودن دوره"
          columns={[
            { id: "title", label: "نام دوره" },
            { id: "institute", label: "نام موسسه / محل آموزش" },
            { id: "date", label: "تاریخ دوره" },
            { id: "duration", label: "مدت زمان دوره" },
            {
              id: "hasCertificate",
              label: "دارای مدرک",
              options: [
                { id: "YES", label: "بله" },
                { id: "NO", label: "خیر" },
              ],
            },
          ]}
          emptyRow={emptyTrainingCourse}
          onChange={setTrainingCourses}
          rows={trainingCourses}
        />

        <SectionTitle>شایستگی‌ها (دانش و مهارت)</SectionTitle>
        <RepeatableSection
          addLabel="افزودن شایستگی"
          columns={[
            { id: "title", label: "عنوان شایستگی" },
            { id: "level", label: "میزان تسلط", options: skillLevelOptions },
          ]}
          emptyRow={emptyCompetency}
          onChange={setCompetencies}
          rows={competencies}
        />

        <SectionTitle>زبان‌های خارجی</SectionTitle>
        <RepeatableSection
          addLabel="افزودن زبان"
          columns={[
            { id: "language", label: "نوع زبان" },
            ...languageSkillFields.map((field) => ({
              id: field.id,
              label: field.label,
              options: skillLevelOptions,
            })),
          ]}
          emptyRow={emptyForeignLanguage}
          maxRows={4}
          onChange={setForeignLanguages}
          rows={foreignLanguages}
        />

        <SectionTitle>نحوه آشنایی با آزمایشگاه</SectionTitle>
        <div className="mt-4 grid gap-4">
          <ChoiceGroup
            label="از چه طریقی با ما آشنا شدید؟"
            name="referralSource"
            onChange={setReferralSource}
            options={referralSourceOptions}
            value={referralSource}
          />
          {referralSource === "REFERRAL" || referralSource === "OTHER" ? (
            <label className={labelClassName}>
              توضیح بیشتر
              <input className={fieldClassName} maxLength={160} name="referralDetail" />
            </label>
          ) : null}
        </div>

        <SectionTitle>سایر اطلاعات</SectionTitle>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <YesNoGroup
            label="امکان ارائه رضایت‌نامه دارید؟"
            name="canProvideConsent"
            onChange={setCanProvideConsent}
            value={canProvideConsent}
          />
          <YesNoGroup
            label="اکنون مشغول به کار هستید؟"
            name="isCurrentlyEmployed"
            onChange={setIsCurrentlyEmployed}
            value={isCurrentlyEmployed}
          />
          {isCurrentlyEmployed === "YES" ? (
            <label className={`${labelClassName} sm:col-span-2`}>
              نشانی محل کار فعلی
              <input className={fieldClassName} maxLength={500} name="currentWorkplace" />
            </label>
          ) : null}
          <YesNoGroup
            label="تصمیم به ادامه تحصیل دارید؟"
            name="plansFurtherStudy"
            onChange={setPlansFurtherStudy}
            value={plansFurtherStudy}
          />
          <YesNoGroup
            label="تصمیم به مهاجرت دارید؟"
            name="plansEmigration"
            onChange={setPlansEmigration}
            value={plansEmigration}
          />
          {plansFurtherStudy === "YES" ? (
            <>
              <label className={labelClassName}>
                رشته مورد نظر
                <input className={fieldClassName} maxLength={120} name="furtherStudyField" />
              </label>
              <label className={labelClassName}>
                زمان ادامه تحصیل
                <input className={fieldClassName} maxLength={120} name="furtherStudyTime" />
              </label>
            </>
          ) : null}
          {plansEmigration === "YES" ? (
            <>
              <label className={labelClassName}>
                به کدام کشور
                <input className={fieldClassName} maxLength={80} name="emigrationCountry" />
              </label>
              <label className={labelClassName}>
                در چه زمانی
                <input className={fieldClassName} maxLength={120} name="emigrationTime" />
              </label>
            </>
          ) : null}
          <label className={labelClassName}>
            مدت زمان سابقه بیمه
            <input className={fieldClassName} maxLength={80} name="insuranceHistory" />
          </label>
          <label className={labelClassName}>
            شماره بیمه
            <input className={fieldClassName} dir="ltr" maxLength={40} name="insuranceNumber" />
          </label>
          <label className={labelClassName}>
            میزان حقوق درخواستی
            <input className={fieldClassName} maxLength={80} name="expectedSalary" placeholder="پاسخ صریح داده شود" />
          </label>
          <label className={labelClassName}>
            از چه تاریخی امکان همکاری دارید؟
            <input className={fieldClassName} maxLength={80} name="availableFrom" />
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            چه مدت قصد همکاری با مجموعه ما را دارید؟
            <input className={fieldClassName} maxLength={120} name="cooperationDuration" />
          </label>
        </div>

        <SectionTitle>مهارت‌ها و ویژگی‌های شخصی</SectionTitle>
        <fieldset className="mt-4 grid gap-2">
          <legend className="pb-2 text-sm font-black text-slate-950">
            کدام تخصص‌ها را دارید؟
          </legend>
          <div className="flex flex-wrap gap-2">
            {specialtyOptions.map((specialty) => (
              <label className={chipClassName} key={specialty}>
                <input className="size-4 accent-teal-500" name="specialties" type="checkbox" value={specialty} />
                {specialty}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5 grid gap-2">
          <legend className="pb-2 text-sm font-black text-slate-950">
            گزینه‌هایی که بهترین توصیف را از شما دارند انتخاب کنید
          </legend>
          <div className="flex flex-wrap gap-2">
            {traitOptions.map((trait) => (
              <label className={chipClassName} key={trait}>
                <input className="size-4 accent-teal-500" name="traits" type="checkbox" value={trait} />
                {trait}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className={`${labelClassName} sm:col-span-2`}>
            مهارت‌های جانبی
            <input className={fieldClassName} maxLength={1000} name="additionalSkills" />
          </label>
          <label className={labelClassName}>
            تفریح مورد علاقه
            <input className={fieldClassName} maxLength={160} name="favoriteHobby" />
          </label>
          <label className={labelClassName}>
            به چه هنری علاقه‌مندید؟
            <input className={fieldClassName} maxLength={160} name="favoriteArt" />
          </label>
          <label className={labelClassName}>
            به چه افراد مشهوری علاقه‌مندید؟
            <input className={fieldClassName} maxLength={200} name="admiredPeople" />
          </label>
          <label className={labelClassName}>
            اهل مطالعه هستید؟
            <input className={fieldClassName} maxLength={80} name="readingHabit" />
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            آخرین کتابی که خواندید
            <input className={fieldClassName} maxLength={160} name="lastBook" />
          </label>
        </div>

        <SectionTitle>پرسش‌های تکمیلی</SectionTitle>
        <div className="mt-4 grid gap-4">
          <label className={labelClassName}>
            ویژگی‌های یک کارمند خوب از دید شما
            <textarea className={`${fieldClassName} min-h-24 resize-y py-3 leading-7`} maxLength={2000} name="goodEmployeeTraits" />
          </label>
          <label className={labelClassName}>
            ویژگی‌های یک مدیر خوب از دید شما
            <textarea className={`${fieldClassName} min-h-24 resize-y py-3 leading-7`} maxLength={2000} name="goodManagerTraits" />
          </label>
          <label className={labelClassName}>
            بهترین دستاوردی که تاکنون داشته‌اید چیست؟
            <textarea className={`${fieldClassName} min-h-24 resize-y py-3 leading-7`} maxLength={2000} name="bestAchievement" />
          </label>
          <label className={labelClassName}>
            الگوی شما در زندگی چه کسی است و چه ویژگی‌های مثبتی دارد؟
            <textarea className={`${fieldClassName} min-h-24 resize-y py-3 leading-7`} maxLength={2000} name="roleModel" />
          </label>
          <label className={labelClassName}>
            اگر لازم باشد هزینهٔ دوره‌های آموزشی ارتقای شخصی را خودتان بپردازید، مایل به انجام آن هستید؟
            <input className={fieldClassName} maxLength={20} name="selfPaidTraining" placeholder="بله / خیر" />
          </label>
          <label className={labelClassName}>
            بهترین دستاورد و نتیجه‌ای که در زندگی یا سازمان داشته‌اید را شرح دهید
            <textarea className={`${fieldClassName} min-h-28 resize-y py-3 leading-7`} maxLength={2000} name="achievementStory" />
          </label>
        </div>

        <SectionTitle hint="در صورت تمایل رزومهٔ خود را پیوست کنید.">
          پیوست رزومه (اختیاری)
        </SectionTitle>
        <label className="mt-4 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center transition hover:border-teal-300 hover:bg-teal-50/60 focus-within:border-teal-500">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-teal-500 ring-1 ring-teal-100">
            <UploadIcon />
          </span>
          <span className="text-sm font-extrabold text-slate-700">
            {resumeName ?? "برای انتخاب فایل کلیک کنید"}
          </span>
          <span className="text-xs font-medium text-slate-500">
            JPG، PNG، WebP یا PDF تا ۸ مگابایت
          </span>
          <input
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            name="resume"
            onChange={(event) => setResumeName(event.target.files?.[0]?.name ?? null)}
            type="file"
          />
        </label>

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium leading-6 text-slate-500">
            {t("careers.localeNote")}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              انصراف
            </button>
            <button
              className="min-h-12 rounded-xl bg-teal-500 px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "در حال ارسال…" : "ارسال فرم استخدام"}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
