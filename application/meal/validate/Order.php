<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/10/1
 * Time: 15:20
 */

namespace app\meal\validate;


use think\Validate;

class Order extends Validate
{
    //定义验证规则
    protected $rule = [
        'day|天' => 'require|number',
        'month|月'  => 'require|number',
        'year|年'      => 'require|number',
        'weekday|星期'     => 'require|number'
    ];

    //定义验证提示
    protected $message = [
        'day.require' => '天不能为空',
        'day.number'    => '天必须为数字',
        'month.require'    => '月不能为空',
        'month.number'      => '月必须为数字',
        'year.require'     => '年不能为空',
        'year.number' => '年必须为数字',
        'weekday.require'  => '星期不能为空',
        'weekday.number'     => '星期必须为数字',
    ];
}