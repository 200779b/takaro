import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@takaro/lib-components';
import { ModuleItemProperties } from 'context/moduleContext';
import { useCronJob, useCronJobUpdate } from 'queries/modules';
import { FC, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { StyledButton } from './style';

interface IProps {
  moduleItem: ModuleItemProperties;
}

interface IFormInputs {
  temporalValue: string;
}

const validationSchema = z.object({
  temporalValue: z.string(),
});

export const CronJobConfig: FC<IProps> = ({ moduleItem }) => {
  const { data } = useCronJob(moduleItem.itemId);
  const { mutateAsync } = useCronJobUpdate();

  const { control, setValue, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (data) {
      setValue('temporalValue', data?.temporalValue);
    }
  }, [data]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    await mutateAsync({
      cronJobId: moduleItem.itemId,
      cronJob: data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        control={control}
        name="temporalValue"
        label="temporalValue"
        description="This controls when the cronjob triggers, you can use https://crontab.guru/ to help you with the syntax."
      />
      <StyledButton fullWidth type="submit" text="Save" />
    </form>
  );
};